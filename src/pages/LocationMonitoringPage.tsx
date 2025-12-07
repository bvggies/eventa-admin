import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { safetyApi } from '../services/api';

interface LocationShare {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  eventId: string | null;
  eventName: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  createdAt: string;
}

export const LocationMonitoringPage: React.FC = () => {
  const [locations, setLocations] = useState<LocationShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationShare | null>(null);

  useEffect(() => {
    loadLocations();
    // Refresh every 15 seconds
    const interval = setInterval(loadLocations, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await safetyApi.getAllAlerts({ status: 'location-shared' });
      const locationShares = response.data.filter((alert: any) => 
        alert.status === 'location-shared' && alert.latitude && alert.longitude
      );
      setLocations(locationShares);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const openMap = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">📍 Location Monitoring</h1>
          <p className="text-text-muted">Monitor user location shares in real-time</p>
        </div>
        <Link
          to="/safety-alerts"
          className="bg-accent-purple hover:bg-accent-purple/80 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          🛡️ View Alerts
        </Link>
        <div className="bg-primary-card border border-gray-800 rounded-lg px-4 py-2">
          <div className="text-text-muted text-sm">Active Shares</div>
          <div className="text-white text-2xl font-bold">{locations.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Locations List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold text-white">Recent Location Shares</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-purple"></div>
            </div>
          ) : locations.length === 0 ? (
            <div className="text-center py-12 bg-primary-card rounded-xl border border-gray-800">
              <p className="text-text-muted">No location shares</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {locations.map((location) => (
                <div
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className={`bg-primary-card rounded-lg p-4 border-2 cursor-pointer transition-all ${
                    selectedLocation?.id === location.id
                      ? 'border-accent-purple'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-medium">{location.userName}</p>
                      <p className="text-text-muted text-xs">{location.userEmail}</p>
                    </div>
                    <span className="text-purple-400 text-xs">📍</span>
                  </div>
                  {location.eventName && (
                    <p className="text-text-muted text-sm mb-2">Event: {location.eventName}</p>
                  )}
                  {location.address && (
                    <p className="text-text-muted text-xs mb-2">{location.address}</p>
                  )}
                  <p className="text-text-muted text-xs">{formatTime(location.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map View */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4">Map View</h2>
          {selectedLocation ? (
            <div className="bg-primary-card rounded-xl border border-gray-800 p-6">
              <div className="mb-4">
                <h3 className="text-white font-bold text-lg mb-2">{selectedLocation.userName}'s Location</h3>
                <p className="text-text-muted text-sm mb-4">{selectedLocation.address || 'Address not available'}</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-text-muted text-xs">Latitude</p>
                    <p className="text-white">{selectedLocation.latitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs">Longitude</p>
                    <p className="text-white">{selectedLocation.longitude.toFixed(6)}</p>
                  </div>
                </div>
                <button
                  onClick={() => openMap(selectedLocation.latitude, selectedLocation.longitude)}
                  className="w-full bg-accent-purple hover:bg-accent-purple/80 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Open in Google Maps
                </button>
              </div>
              <div className="bg-gray-900 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6d_s6H4cT0JhYVE&q=${selectedLocation.latitude},${selectedLocation.longitude}&zoom=15`}
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ) : (
            <div className="bg-primary-card rounded-xl border border-gray-800 p-12 text-center">
              <p className="text-text-muted">Select a location from the list to view on map</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

