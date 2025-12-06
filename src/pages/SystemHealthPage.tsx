import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

export const SystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState({
    database: 'checking',
    api: 'checking',
    storage: 'checking',
  });
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    checkHealth();
    loadStats();
    const interval = setInterval(() => {
      checkHealth();
      loadStats();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      // Check API
      const response = await adminApi.getAnalytics();
      setHealth((prev) => ({ ...prev, api: 'healthy', database: 'healthy' }));
    } catch (error) {
      setHealth((prev) => ({ ...prev, api: 'unhealthy', database: 'unhealthy' }));
    }

    // Check storage
    try {
      localStorage.setItem('health-check', 'ok');
      localStorage.removeItem('health-check');
      setHealth((prev) => ({ ...prev, storage: 'healthy' }));
    } catch (error) {
      setHealth((prev) => ({ ...prev, storage: 'unhealthy' }));
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminApi.getAnalytics();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'healthy') return 'text-green-400';
    if (status === 'unhealthy') return 'text-red-400';
    return 'text-yellow-400';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'healthy') return '✅';
    if (status === 'unhealthy') return '❌';
    return '⏳';
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-white mb-8">System Health</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Database</h3>
            <span className={`text-2xl ${getStatusColor(health.database)}`}>
              {getStatusIcon(health.database)}
            </span>
          </div>
          <p className={`text-sm ${getStatusColor(health.database)}`}>
            {health.database === 'healthy' ? 'Connected' : health.database === 'unhealthy' ? 'Disconnected' : 'Checking...'}
          </p>
        </div>

        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">API Server</h3>
            <span className={`text-2xl ${getStatusColor(health.api)}`}>
              {getStatusIcon(health.api)}
            </span>
          </div>
          <p className={`text-sm ${getStatusColor(health.api)}`}>
            {health.api === 'healthy' ? 'Operational' : health.api === 'unhealthy' ? 'Down' : 'Checking...'}
          </p>
        </div>

        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Storage</h3>
            <span className={`text-2xl ${getStatusColor(health.storage)}`}>
              {getStatusIcon(health.storage)}
            </span>
          </div>
          <p className={`text-sm ${getStatusColor(health.storage)}`}>
            {health.storage === 'healthy' ? 'Available' : health.storage === 'unhealthy' ? 'Blocked' : 'Checking...'}
          </p>
        </div>
      </div>

      {stats && (
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">System Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-text-muted text-sm">Total Events</p>
              <p className="text-2xl font-bold text-white">{stats.totalEvents || 0}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats.totalUsers || 0}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Total Tickets</p>
              <p className="text-2xl font-bold text-white">{stats.totalTickets || 0}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">GHS {stats.totalRevenue || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

