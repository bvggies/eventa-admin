import React, { useState, useEffect } from 'react';
import { eventsApi, authApi } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  is_organizer: boolean;
  is_admin: boolean;
  created_at: string;
}

export const AdminManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<'promote' | 'demote' | 'suspend' | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // This would be a new API endpoint: GET /api/admin/users
      // For now, we'll show a placeholder
      setUsers([]);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (user: User, actionType: 'promote' | 'demote' | 'suspend') => {
    setSelectedUser(user);
    setAction(actionType);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedUser || !action) return;

    try {
      // API call would go here
      // await adminApi.updateUserRole(selectedUser.id, action);
      setShowModal(false);
      setSelectedUser(null);
      setAction(null);
      loadUsers();
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="text-white text-center py-12">Loading admin management...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Super Admin Management</h1>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="text-3xl mb-2">👑</div>
          <h3 className="text-text-muted text-sm mb-1">Super Admins</h3>
          <p className="text-3xl font-bold text-white">
            {users.filter((u) => u.is_admin).length}
          </p>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="text-3xl mb-2">✅</div>
          <h3 className="text-text-muted text-sm mb-1">Organizers</h3>
          <p className="text-3xl font-bold text-white">
            {users.filter((u) => u.is_organizer && !u.is_admin).length}
          </p>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="text-3xl mb-2">👤</div>
          <h3 className="text-text-muted text-sm mb-1">Total Users</h3>
          <p className="text-3xl font-bold text-white">{users.length}</p>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="text-3xl mb-2">⏳</div>
          <h3 className="text-text-muted text-sm mb-1">Pending Approvals</h3>
          <p className="text-3xl font-bold text-white">0</p>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">User Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-text-muted">Name</th>
                <th className="text-left py-3 px-4 text-text-muted">Email</th>
                <th className="text-left py-3 px-4 text-text-muted">Role</th>
                <th className="text-left py-3 px-4 text-text-muted">Joined</th>
                <th className="text-left py-3 px-4 text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">
                    No users found. User management API endpoint needs to be implemented.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-800 hover:bg-primary-dark transition-colors"
                  >
                    <td className="py-3 px-4 text-white font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-white">{user.email}</td>
                    <td className="py-3 px-4">
                      {user.is_admin ? (
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30">
                          👑 Super Admin
                        </span>
                      ) : user.is_organizer ? (
                        <span className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-sm border border-teal-500/30">
                          ✅ Organizer
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm border border-gray-500/30">
                          👤 User
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-text-muted text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {!user.is_admin && (
                          <button
                            onClick={() => handleAction(user, 'promote')}
                            className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
                          >
                            Promote
                          </button>
                        )}
                        {user.is_admin && (
                          <button
                            onClick={() => handleAction(user, 'demote')}
                            className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30 transition-colors"
                          >
                            Demote
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(user, 'suspend')}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                        >
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-primary-card rounded-xl p-6 border border-gray-800 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              {action === 'promote' && 'Promote to Super Admin'}
              {action === 'demote' && 'Demote from Super Admin'}
              {action === 'suspend' && 'Suspend User'}
            </h3>
            <p className="text-text-muted mb-6">
              Are you sure you want to {action} {selectedUser.name} ({selectedUser.email})?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                  setAction(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                  action === 'suspend'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-accent-purple hover:bg-purple-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Placeholders */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">🔒 Platform Moderation</h3>
          <p className="text-text-muted text-sm mb-4">
            Moderate content, manage reports, and handle user violations.
          </p>
          <button className="px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-colors">
            Coming Soon
          </button>
        </div>

        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">💰 Financial Control</h3>
          <p className="text-text-muted text-sm mb-4">
            Manage revenue, payouts, and commission settings.
          </p>
          <button className="px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-colors">
            Coming Soon
          </button>
        </div>

        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">⚙️ Platform Settings</h3>
          <p className="text-text-muted text-sm mb-4">
            Configure branding, notifications, and system settings.
          </p>
          <button className="px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-colors">
            Coming Soon
          </button>
        </div>

        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">📊 Audit Logs</h3>
          <p className="text-text-muted text-sm mb-4">
            View admin actions, security events, and system logs.
          </p>
          <button className="px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-colors">
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
};

