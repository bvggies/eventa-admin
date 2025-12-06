import React, { useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { storage } from '../utils/storage';

export const AdminProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Update profile via API
      // await authApi.updateProfile(formData);
      setProfile({ ...profile, ...formData });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="text-white text-center py-12">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Profile Information</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-purple"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-purple"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-purple"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: profile.name || '',
                        email: profile.email || '',
                        phone: profile.phone || '',
                      });
                    }}
                    className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Name</label>
                  <p className="text-white text-lg">{profile?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Email</label>
                  <p className="text-white text-lg">{profile?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Phone</label>
                  <p className="text-white text-lg">{profile?.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Role</label>
                  <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30">
                    👑 Super Admin
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Member Since</label>
                  <p className="text-white text-lg">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <div className="space-y-6">
          <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-4">Account Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-text-muted text-sm">Account Status</p>
                <p className="text-green-400 font-semibold">Active</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">Last Login</p>
                <p className="text-white">Just now</p>
              </div>
            </div>
          </div>

          <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-4">Security</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-primary-dark border border-gray-700 rounded-lg text-white hover:border-accent-purple transition-colors text-left">
                Change Password
              </button>
              <button className="w-full px-4 py-2 bg-primary-dark border border-gray-700 rounded-lg text-white hover:border-accent-purple transition-colors text-left">
                Two-Factor Authentication
              </button>
              <button className="w-full px-4 py-2 bg-primary-dark border border-gray-700 rounded-lg text-white hover:border-accent-purple transition-colors text-left">
                Active Sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

