import React, { useState, useEffect } from 'react';

interface AuditLog {
  id: string;
  action: string;
  user: string;
  resource: string;
  timestamp: string;
  ip: string;
}

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Load audit logs from backend
    // For now, using mock data
    setTimeout(() => {
      setLogs([
        {
          id: '1',
          action: 'User Created',
          user: 'admin@eventa.com',
          resource: 'User: john@example.com',
          timestamp: new Date().toISOString(),
          ip: '192.168.1.1',
        },
        {
          id: '2',
          action: 'Event Deleted',
          user: 'admin@eventa.com',
          resource: 'Event: Beach Party',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          ip: '192.168.1.1',
        },
        {
          id: '3',
          action: 'User Promoted',
          user: 'admin@eventa.com',
          resource: 'User: organizer@eventa.com',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          ip: '192.168.1.1',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getActionColor = (action: string) => {
    if (action.includes('Created')) return 'text-green-400';
    if (action.includes('Deleted')) return 'text-red-400';
    if (action.includes('Updated') || action.includes('Promoted')) return 'text-blue-400';
    return 'text-white';
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="text-white text-center py-12">Loading audit logs...</div>
      </div>
    );
  }

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'create') return log.action.includes('Created');
    if (filter === 'update') return log.action.includes('Updated') || log.action.includes('Promoted');
    if (filter === 'delete') return log.action.includes('Deleted');
    return true;
  });

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-primary-card border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-purple"
        >
          <option value="all">All Actions</option>
          <option value="create">Created</option>
          <option value="update">Updated</option>
          <option value="delete">Deleted</option>
        </select>
      </div>

      {/* Audit Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="text-text-muted text-sm mb-1">Total Logs</h3>
          <p className="text-3xl font-bold text-white">{logs.length}</p>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="text-3xl mb-2">➕</div>
          <h3 className="text-text-muted text-sm mb-1">Created</h3>
          <p className="text-3xl font-bold text-green-400">
            {logs.filter((l) => l.action.includes('Created')).length}
          </p>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="text-3xl mb-2">✏️</div>
          <h3 className="text-text-muted text-sm mb-1">Updated</h3>
          <p className="text-3xl font-bold text-blue-400">
            {logs.filter((l) => l.action.includes('Updated') || l.action.includes('Promoted')).length}
          </p>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="text-3xl mb-2">🗑️</div>
          <h3 className="text-text-muted text-sm mb-1">Deleted</h3>
          <p className="text-3xl font-bold text-red-400">
            {logs.filter((l) => l.action.includes('Deleted')).length}
          </p>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-text-muted">Timestamp</th>
                <th className="text-left py-3 px-4 text-text-muted">Action</th>
                <th className="text-left py-3 px-4 text-text-muted">User</th>
                <th className="text-left py-3 px-4 text-text-muted">Resource</th>
                <th className="text-left py-3 px-4 text-text-muted">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-800 hover:bg-primary-dark transition-colors"
                  >
                    <td className="py-3 px-4 text-text-muted text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className={`py-3 px-4 font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-white">{log.user}</td>
                    <td className="py-3 px-4 text-white">{log.resource}</td>
                    <td className="py-3 px-4 text-text-muted text-sm">{log.ip}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

