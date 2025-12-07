import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { safetyApi } from '../services/api';

interface SafetyAlert {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  eventId: string | null;
  eventName: string | null;
  status: 'safe' | 'check-in' | 'emergency' | 'location-shared';
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  message: string | null;
  isEmergency: boolean;
  acknowledgedByAdmin: boolean;
  acknowledgedAt: string | null;
  createdAt: string;
}

export const SafetyAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [emergencies, setEmergencies] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'emergency' | 'location' | 'check-in' | 'safe'>('all');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
    // Refresh every 10 seconds for real-time updates
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [alertsRes, emergenciesRes, statsRes] = await Promise.all([
        safetyApi.getAllAlerts({ status: filter === 'all' ? undefined : filter, isEmergency: filter === 'emergency' ? 'true' : undefined }),
        safetyApi.getUnacknowledgedEmergencies(),
        safetyApi.getStatistics(),
      ]);
      setAlerts(alertsRes.data);
      setEmergencies(emergenciesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading safety data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await safetyApi.acknowledgeAlert(id);
      loadData();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      alert('Failed to acknowledge alert');
    }
  };

  const getStatusColor = (status: string, isEmergency: boolean) => {
    if (isEmergency) return 'bg-red-500';
    if (status === 'safe') return 'bg-green-500';
    if (status === 'check-in') return 'bg-blue-500';
    if (status === 'location-shared') return 'bg-purple-500';
    return 'bg-gray-500';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const openMap = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">🛡️ Safety Alerts</h1>
          <p className="text-text-muted">Monitor user safety and emergency alerts</p>
        </div>
        <Link
          to="/location-monitoring"
          className="bg-accent-purple hover:bg-accent-purple/80 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          📍 View Locations
        </Link>
        {stats && (
          <div className="flex gap-4">
            <div className="bg-red-500/20 border border-red-500 rounded-lg px-4 py-2">
              <div className="text-red-400 text-sm">Unacknowledged</div>
              <div className="text-white text-2xl font-bold">{stats.unacknowledged_emergencies || 0}</div>
            </div>
            <div className="bg-primary-card border border-gray-800 rounded-lg px-4 py-2">
              <div className="text-text-muted text-sm">Last 24h</div>
              <div className="text-white text-2xl font-bold">{stats.last_24_hours || 0}</div>
            </div>
          </div>
        )}
      </div>

      {/* High Priority Emergency Banner */}
      {emergencies.length > 0 && (
        <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">🚨 ACTIVE EMERGENCIES</h2>
              <p className="text-white">{emergencies.length} unacknowledged emergency{alerts.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => setFilter('emergency')}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
            >
              View All Emergencies
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        {(['all', 'emergency', 'location', 'check-in', 'safe'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === f
                ? 'text-accent-purple border-b-2 border-accent-purple'
                : 'text-text-muted hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-purple"></div>
          <p className="text-text-muted mt-4">Loading alerts...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 bg-primary-card rounded-xl border border-gray-800">
          <p className="text-text-muted">No alerts found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-primary-card rounded-xl p-6 border-2 ${
                alert.isEmergency && !alert.acknowledgedByAdmin
                  ? 'border-red-500 animate-pulse'
                  : 'border-gray-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(alert.status, alert.isEmergency)}`}></div>
                    <span className="text-white font-bold text-lg">
                      {alert.isEmergency ? '🚨 EMERGENCY' : alert.status.toUpperCase().replace('-', ' ')}
                    </span>
                    {!alert.acknowledgedByAdmin && alert.isEmergency && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">NEW</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-text-muted text-sm">User</p>
                      <p className="text-white font-medium">{alert.userName}</p>
                      <p className="text-text-muted text-xs">{alert.userEmail}</p>
                      {alert.userPhone && (
                        <p className="text-text-muted text-xs">📞 {alert.userPhone}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-text-muted text-sm">Event</p>
                      <p className="text-white font-medium">{alert.eventName || 'N/A'}</p>
                      <p className="text-text-muted text-xs">{formatTime(alert.createdAt)}</p>
                    </div>
                  </div>

                  {alert.address && (
                    <div className="mb-3">
                      <p className="text-text-muted text-sm">Location</p>
                      <p className="text-white">{alert.address}</p>
                      {alert.latitude && alert.longitude && (
                        <button
                          onClick={() => openMap(alert.latitude!, alert.longitude!)}
                          className="text-accent-purple text-sm mt-1 hover:underline"
                        >
                          📍 View on Map
                        </button>
                      )}
                    </div>
                  )}

                  {alert.message && (
                    <div className="mb-3 p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-text-muted text-sm mb-1">Message</p>
                      <p className="text-white">{alert.message}</p>
                    </div>
                  )}

                  {alert.acknowledgedByAdmin && (
                    <p className="text-green-400 text-sm">✓ Acknowledged at {formatTime(alert.acknowledgedAt!)}</p>
                  )}
                </div>

                {!alert.acknowledgedByAdmin && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="bg-accent-purple hover:bg-accent-purple/80 text-white px-4 py-2 rounded-lg font-medium transition-colors ml-4"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

