import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  is_organizer: boolean;
  is_admin: boolean;
  created_at: string;
}

interface Badge {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  category: string;
}

interface UserBadge {
  id: string;
  badge_id: string;
  user_id: string;
  earned_at: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  category: string;
}

export const AdminManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [action, setAction] = useState<'promote' | 'demote' | 'suspend' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    is_organizer: false,
    is_admin: false,
  });
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [badgeUser, setBadgeUser] = useState<User | null>(null);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      const response = await adminApi.getUsers({
        search: searchTerm,
        role: roleFilter,
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await adminApi.createUser(newUser);
      setShowCreateModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        phone: '',
        is_organizer: false,
        is_admin: false,
      });
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error creating user');
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
      if (action === 'promote') {
        await adminApi.updateUser(selectedUser.id, { is_admin: true, is_organizer: true });
      } else if (action === 'demote') {
        await adminApi.updateUser(selectedUser.id, { is_admin: false });
      } else if (action === 'suspend') {
        // For suspend, we could add a suspended field or just delete
        // For now, we'll just delete
        await adminApi.deleteUser(selectedUser.id);
      }
      setShowModal(false);
      setSelectedUser(null);
      setAction(null);
      loadUsers();
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Error performing action. Please try again.');
    }
  };

  const handleManageBadges = async (user: User) => {
    setBadgeUser(user);
    setShowBadgeModal(true);
    setLoadingBadges(true);
    try {
      const [badgesRes, userBadgesRes] = await Promise.all([
        adminApi.getAllBadges(),
        adminApi.getUserBadges(user.id),
      ]);
      setAllBadges(badgesRes.data.badges || []);
      setUserBadges(userBadgesRes.data.badges || []);
    } catch (error) {
      console.error('Error loading badges:', error);
      alert('Error loading badges. Please try again.');
    } finally {
      setLoadingBadges(false);
    }
  };

  const handleAwardBadge = async (badgeId: string) => {
    if (!badgeUser) return;

    try {
      await adminApi.awardBadge({ userId: badgeUser.id, badgeId });
      // Reload user badges
      const userBadgesRes = await adminApi.getUserBadges(badgeUser.id);
      setUserBadges(userBadgesRes.data.badges || []);
      alert('Badge awarded successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error awarding badge. Please try again.');
    }
  };

  const handleRemoveBadge = async (badgeId: string) => {
    if (!badgeUser) return;

    if (!window.confirm('Are you sure you want to remove this badge from the user?')) {
      return;
    }

    try {
      await adminApi.removeBadge({ userId: badgeUser.id, badgeId });
      // Reload user badges
      const userBadgesRes = await adminApi.getUserBadges(badgeUser.id);
      setUserBadges(userBadgesRes.data.badges || []);
      alert('Badge removed successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error removing badge. Please try again.');
    }
  };

  const hasBadge = (badgeId: string) => {
    return userBadges.some((ub) => ub.badge_id === badgeId);
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
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-accent-purple text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          + Add User
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 bg-primary-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-purple"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-primary-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-purple"
        >
          <option value="">All Roles</option>
          <option value="admin">Admins</option>
          <option value="organizer">Organizers</option>
          <option value="user">Users</option>
        </select>
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
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleManageBadges(user)}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                          title="Manage Badges"
                        >
                          🏆 Badges
                        </button>
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-primary-card rounded-xl p-6 border border-gray-800 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Create New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 bg-primary-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 bg-primary-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 bg-primary-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Phone</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-primary-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-purple"
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newUser.is_organizer}
                    onChange={(e) => setNewUser({ ...newUser, is_organizer: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-white text-sm">Organizer</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newUser.is_admin}
                    onChange={(e) => setNewUser({ ...newUser, is_admin: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-white text-sm">Admin</span>
                </label>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleCreateUser}
                  className="flex-1 px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create User
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewUser({
                      name: '',
                      email: '',
                      password: '',
                      phone: '',
                      is_organizer: false,
                      is_admin: false,
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/moderation"
          className="bg-primary-card rounded-xl p-6 border border-gray-800 hover:border-accent-purple transition-all duration-200 hover:scale-105 cursor-pointer block"
        >
          <h3 className="text-lg font-bold text-white mb-4">🔒 Platform Moderation</h3>
          <p className="text-text-muted text-sm mb-4">
            Moderate content, manage reports, and handle user violations.
          </p>
          <span className="text-accent-purple text-sm font-medium">View Page →</span>
        </Link>

        <Link
          to="/financial"
          className="bg-primary-card rounded-xl p-6 border border-gray-800 hover:border-accent-purple transition-all duration-200 hover:scale-105 cursor-pointer block"
        >
          <h3 className="text-lg font-bold text-white mb-4">💰 Financial Control</h3>
          <p className="text-text-muted text-sm mb-4">
            Manage revenue, payouts, and commission settings.
          </p>
          <span className="text-accent-purple text-sm font-medium">View Page →</span>
        </Link>

        <Link
          to="/settings"
          className="bg-primary-card rounded-xl p-6 border border-gray-800 hover:border-accent-purple transition-all duration-200 hover:scale-105 cursor-pointer block"
        >
          <h3 className="text-lg font-bold text-white mb-4">⚙️ Platform Settings</h3>
          <p className="text-text-muted text-sm mb-4">
            Configure branding, notifications, and system settings.
          </p>
          <span className="text-accent-purple text-sm font-medium">View Page →</span>
        </Link>

        <Link
          to="/audit-logs"
          className="bg-primary-card rounded-xl p-6 border border-gray-800 hover:border-accent-purple transition-all duration-200 hover:scale-105 cursor-pointer block"
        >
          <h3 className="text-lg font-bold text-white mb-4">📊 Audit Logs</h3>
          <p className="text-text-muted text-sm mb-4">
            View admin actions, security events, and system logs.
          </p>
          <span className="text-accent-purple text-sm font-medium">View Page →</span>
        </Link>

        <Link
          to="/bulk-operations"
          className="bg-primary-card rounded-xl p-6 border border-gray-800 hover:border-accent-purple transition-all duration-200 hover:scale-105 cursor-pointer block"
        >
          <h3 className="text-lg font-bold text-white mb-4">⚡ Bulk Operations</h3>
          <p className="text-text-muted text-sm mb-4">
            Perform bulk actions on multiple events at once.
          </p>
          <span className="text-accent-purple text-sm font-medium">View Page →</span>
        </Link>

        <Link
          to="/system-health"
          className="bg-primary-card rounded-xl p-6 border border-gray-800 hover:border-accent-purple transition-all duration-200 hover:scale-105 cursor-pointer block"
        >
          <h3 className="text-lg font-bold text-white mb-4">💚 System Health</h3>
          <p className="text-text-muted text-sm mb-4">
            Monitor system status, database, and API health.
          </p>
          <span className="text-accent-purple text-sm font-medium">View Page →</span>
        </Link>
      </div>

      {/* Badge Management Modal */}
      {showBadgeModal && badgeUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-card rounded-xl border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 sticky top-0 bg-primary-card z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">Manage Badges</h3>
                  <p className="text-text-muted text-sm mt-1">
                    {badgeUser.name} ({badgeUser.email})
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowBadgeModal(false);
                    setBadgeUser(null);
                    setUserBadges([]);
                    setAllBadges([]);
                  }}
                  className="text-text-muted hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {loadingBadges ? (
                <div className="text-center py-12 text-text-muted">Loading badges...</div>
              ) : (
                <>
                  {/* User's Current Badges */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-white mb-4">
                      Current Badges ({userBadges.length})
                    </h4>
                    {userBadges.length === 0 ? (
                      <p className="text-text-muted text-sm">No badges awarded yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userBadges.map((badge) => (
                          <div
                            key={badge.id}
                            className="bg-primary-dark rounded-lg p-4 border border-gray-700 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{badge.icon}</span>
                              <div>
                                <h5 className="text-white font-medium">{badge.display_name}</h5>
                                <p className="text-text-muted text-sm">{badge.description}</p>
                                <p className="text-text-muted text-xs mt-1">
                                  Earned: {new Date(badge.earned_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveBadge(badge.badge_id)}
                              className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Available Badges to Award */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">
                      Available Badges to Award
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allBadges.map((badge) => {
                        const userHasBadge = hasBadge(badge.id);
                        return (
                          <div
                            key={badge.id}
                            className={`bg-primary-dark rounded-lg p-4 border ${
                              userHasBadge
                                ? 'border-green-500/30 bg-green-500/5'
                                : 'border-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{badge.icon}</span>
                                <div>
                                  <h5 className="text-white font-medium">{badge.display_name}</h5>
                                  <p className="text-text-muted text-sm">{badge.description}</p>
                                  <span className="inline-block mt-1 px-2 py-0.5 bg-gray-700/50 text-text-muted text-xs rounded">
                                    {badge.category}
                                  </span>
                                </div>
                              </div>
                              {userHasBadge ? (
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                                  ✓ Awarded
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleAwardBadge(badge.id)}
                                  className="px-3 py-1 bg-accent-purple/20 text-accent-purple rounded-lg text-sm hover:bg-accent-purple/30 transition-colors"
                                >
                                  Award
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

