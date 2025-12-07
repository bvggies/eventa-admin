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
  status: 'safe' | 'check-in' | 'emergency' | 'location-shared' | 'sos-broadcast';
  alertType?: 'SAFE' | 'ALERT' | 'EMERGENCY' | 'HIGH_ALERT' | 'SOS';
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  message: string | null;
  isEmergency: boolean;
  isHighAlert?: boolean;
  googleMapsUrl?: string | null;
  acknowledgedByAdmin: boolean;
  acknowledgedAt: string | null;
  createdAt: string;
}

export const SafetyAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [liveFeed, setLiveFeed] = useState<SafetyAlert[]>([]);
  const [emergencies, setEmergencies] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'emergency' | 'location' | 'check-in' | 'safe'>('all');
  const [stats, setStats] = useState<any>(null);
  const [showLiveFeed, setShowLiveFeed] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'priority'>('recent');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadData();
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(() => {
      loadData();
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [alertsRes, feedRes, emergenciesRes, statsRes] = await Promise.all([
        safetyApi.getAllAlerts({ status: filter === 'all' ? undefined : filter, isEmergency: filter === 'emergency' ? 'true' : undefined }),
        safetyApi.getLiveFeed({ limit: 20 }),
        safetyApi.getUnacknowledgedEmergencies(),
        safetyApi.getStatistics(),
      ]);
      setAlerts(alertsRes.data);
      setLiveFeed(feedRes.data);
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

  const handleAcknowledgeAll = async () => {
    if (!confirm('Acknowledge all unacknowledged alerts?')) return;
    try {
      const unacknowledged = alerts.filter(a => !a.acknowledgedByAdmin);
      await Promise.all(unacknowledged.map(a => safetyApi.acknowledgeAlert(a.id)));
      loadData();
    } catch (error) {
      console.error('Error acknowledging all alerts:', error);
      alert('Failed to acknowledge some alerts');
    }
  };

  const handleCallUser = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailUser = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'User', 'Email', 'Phone', 'Event', 'Type', 'Status', 'Location', 'Time'].join(','),
      ...alerts.map(a => [
        a.id,
        `"${a.userName}"`,
        `"${a.userEmail}"`,
        `"${a.userPhone || ''}"`,
        `"${a.eventName || 'N/A'}"`,
        a.alertType || a.status,
        a.isEmergency ? 'EMERGENCY' : a.isHighAlert ? 'HIGH_ALERT' : 'NORMAL',
        `"${a.address || 'N/A'}"`,
        new Date(a.createdAt).toISOString(),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safety-alerts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getAlertTypeColor = (alertType?: string, isEmergency?: boolean, isHighAlert?: boolean) => {
    if (isEmergency || alertType === 'EMERGENCY' || alertType === 'SOS') return 'border-red-500 bg-red-500/10';
    if (isHighAlert || alertType === 'HIGH_ALERT') return 'border-yellow-500 bg-yellow-500/10';
    if (alertType === 'SAFE') return 'border-green-500 bg-green-500/10';
    return 'border-gray-500 bg-gray-500/10';
  };

  const getAlertTypeIcon = (alertType?: string, isEmergency?: boolean) => {
    if (isEmergency || alertType === 'EMERGENCY') return '🟥';
    if (alertType === 'SOS') return '🆘';
    if (alertType === 'HIGH_ALERT') return '🟨';
    if (alertType === 'SAFE') return '🟩';
    return '🟦';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const openMap = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  // Filter and sort alerts
  const filteredAlerts = alerts
    .filter(alert => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        alert.userName?.toLowerCase().includes(query) ||
        alert.userEmail?.toLowerCase().includes(query) ||
        alert.eventName?.toLowerCase().includes(query) ||
        alert.address?.toLowerCase().includes(query) ||
        alert.status?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        // Sort by priority: Emergency > High Alert > Others
        const aPriority = a.isEmergency ? 3 : a.isHighAlert ? 2 : 1;
        const bPriority = b.isEmergency ? 3 : b.isHighAlert ? 2 : 1;
        if (aPriority !== bPriority) return bPriority - aPriority;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      // Recent (default)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const unacknowledgedCount = alerts.filter(a => !a.acknowledgedByAdmin && (a.isEmergency || a.isHighAlert)).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">🛡️ Safety Monitor Panel</h1>
          <p className="text-text-muted">Real-time safety monitoring and emergency alerts</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-text-muted">
              Last updated: {formatTime(lastUpdate.toISOString())}
            </span>
          </div>
        </div>
        {stats && (
          <div className="flex gap-4 flex-wrap">
            <div className="bg-red-500/20 border border-red-500 rounded-lg px-4 py-2">
              <div className="text-red-400 text-sm">Emergency Triggers</div>
              <div className="text-white text-2xl font-bold">{stats.total_emergencies || 0}</div>
            </div>
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg px-4 py-2">
              <div className="text-yellow-400 text-sm">High Alert</div>
              <div className="text-white text-2xl font-bold">{stats.high_alerts || 0}</div>
            </div>
            <div className="bg-green-500/20 border border-green-500 rounded-lg px-4 py-2">
              <div className="text-green-400 text-sm">Safety Sent</div>
              <div className="text-white text-2xl font-bold">{stats.safety_sent || 0}</div>
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">🚨 CRITICAL ALERT</h2>
              <p className="text-white">{emergencies.length} unacknowledged emergency{emergencies.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('emergency')}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                View All Emergencies
              </button>
              {unacknowledgedCount > 0 && (
                <button
                  onClick={handleAcknowledgeAll}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  Acknowledge All ({unacknowledgedCount})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Safety Feed */}
      {showLiveFeed && (
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">📡 Live Safety Feed</h2>
            <button
              onClick={() => setShowLiveFeed(false)}
              className="text-text-muted hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {liveFeed.length === 0 ? (
              <p className="text-text-muted text-center py-4">No recent activity</p>
            ) : (
              liveFeed.slice(0, 10).map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-l-4 transition-all hover:bg-gray-800/50 ${getAlertTypeColor(alert.alertType, alert.isEmergency, alert.isHighAlert)}`}
                >
                  <span className="text-2xl">{getAlertTypeIcon(alert.alertType, alert.isEmergency)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{alert.userName || 'Unknown User'}</span>
                      <span className="text-text-muted text-sm">
                        {alert.isEmergency ? 'Emergency Trigger' : 
                         alert.isHighAlert ? 'Location Shared' : 
                         alert.alertType === 'SAFE' ? 'Safe Status' : 
                         alert.status}
                      </span>
                    </div>
                    <div className="text-text-muted text-xs">
                      {formatTime(alert.createdAt)} • {alert.eventName || alert.address || 'Location'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by user, event, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-primary-card border border-gray-800 rounded-lg px-4 py-2 pl-10 text-white placeholder-text-muted focus:outline-none focus:border-accent-purple"
            />
            <span className="absolute left-3 top-2.5 text-text-muted">🔍</span>
          </div>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'oldest' | 'priority')}
          className="bg-primary-card border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-purple"
        >
          <option value="recent">Sort: Recent</option>
          <option value="oldest">Sort: Oldest</option>
          <option value="priority">Sort: Priority</option>
        </select>
        <button
          onClick={handleExport}
          className="bg-accent-purple hover:bg-accent-purple/80 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          📥 Export CSV
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        {(['all', 'emergency', 'location', 'check-in', 'safe'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-medium transition-colors relative ${
              filter === f
                ? 'text-accent-purple border-b-2 border-accent-purple'
                : 'text-text-muted hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
            {f === 'emergency' && emergencies.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {emergencies.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-purple"></div>
          <p className="text-text-muted mt-4">Loading alerts...</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-12 bg-primary-card rounded-xl border border-gray-800">
          <p className="text-text-muted">No alerts found</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-accent-purple hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-primary-card rounded-xl p-6 border-l-4 transition-all hover:shadow-lg ${
                alert.isEmergency && !alert.acknowledgedByAdmin
                  ? 'border-red-500 animate-pulse'
                  : getAlertTypeColor(alert.alertType, alert.isEmergency, alert.isHighAlert)
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="text-2xl">{getAlertTypeIcon(alert.alertType, alert.isEmergency)}</span>
                    <span className="text-white font-bold text-lg">
                      {alert.isEmergency ? '🚨 EMERGENCY' : 
                       alert.isHighAlert ? '🟨 HIGH ALERT' :
                       alert.alertType === 'SAFE' ? '🟩 SAFE STATUS' :
                       alert.status.toUpperCase().replace('-', ' ')}
                    </span>
                    {!alert.acknowledgedByAdmin && (alert.isEmergency || alert.isHighAlert) && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded animate-pulse">NEW</span>
                    )}
                    {alert.acknowledgedByAdmin && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">✓ Acknowledged</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-text-muted text-sm mb-1">User</p>
                      <p className="text-white font-medium">{alert.userName}</p>
                      <div className="flex gap-2 mt-1">
                        {alert.userEmail && (
                          <button
                            onClick={() => handleEmailUser(alert.userEmail)}
                            className="text-accent-purple text-xs hover:underline"
                          >
                            📧 Email
                          </button>
                        )}
                        {alert.userPhone && (
                          <button
                            onClick={() => handleCallUser(alert.userPhone)}
                            className="text-accent-purple text-xs hover:underline"
                          >
                            📞 Call
                          </button>
                        )}
                      </div>
                      {alert.userPhone && (
                        <p className="text-text-muted text-xs mt-1">📞 {alert.userPhone}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-text-muted text-sm mb-1">Event</p>
                      <p className="text-white font-medium">{alert.eventName || 'N/A'}</p>
                      <p className="text-text-muted text-xs mt-1">{formatTime(alert.createdAt)}</p>
                    </div>
                  </div>

                  {alert.address && (
                    <div className="mb-3">
                      <p className="text-text-muted text-sm mb-1">Location</p>
                      <p className="text-white">{alert.address}</p>
                      {alert.latitude && alert.longitude && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => openMap(alert.latitude!, alert.longitude!)}
                            className="text-accent-purple text-sm hover:underline flex items-center gap-1"
                          >
                            📍 View on Map
                          </button>
                          {alert.googleMapsUrl && (
                            <a
                              href={alert.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent-purple text-sm hover:underline flex items-center gap-1"
                            >
                              🔗 Google Maps
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {alert.message && (
                    <div className="mb-3 p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-text-muted text-sm mb-1">Message</p>
                      <p className="text-white">{alert.message}</p>
                    </div>
                  )}

                  {alert.acknowledgedByAdmin && alert.acknowledgedAt && (
                    <p className="text-green-400 text-sm">✓ Acknowledged at {formatTime(alert.acknowledgedAt)}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {!alert.acknowledgedByAdmin && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="bg-accent-purple hover:bg-accent-purple/80 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
                    >
                      ✓ Acknowledge
                    </button>
                  )}
                  {alert.latitude && alert.longitude && (
                    <button
                      onClick={() => openMap(alert.latitude!, alert.longitude!)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
                    >
                      📍 Map
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
