import React, { useState } from 'react';

export const PlatformSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'Eventa',
    siteDescription: 'Ghana\'s Premier Event Discovery Platform',
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: false,
    defaultCurrency: 'GHS',
    commissionRate: 10,
  });

  const handleSave = () => {
    // Save settings to backend
    alert('Settings saved! (Backend integration needed)');
  };

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Platform Settings</h1>
      </div>

      {/* Settings Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="text-3xl mb-2">⚙️</div>
          <h3 className="text-text-muted text-sm mb-1">Active Settings</h3>
          <p className="text-3xl font-bold text-white">12</p>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="text-3xl mb-2">🔔</div>
          <h3 className="text-text-muted text-sm mb-1">Notification Templates</h3>
          <p className="text-3xl font-bold text-white">5</p>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="text-3xl mb-2">🎨</div>
          <h3 className="text-text-muted text-sm mb-1">Branding Configs</h3>
          <p className="text-3xl font-bold text-white">3</p>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="text-3xl mb-2">🔒</div>
          <h3 className="text-text-muted text-sm mb-1">Security Rules</h3>
          <p className="text-3xl font-bold text-white">8</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-purple"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Site Description</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-purple"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Default Currency</label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-purple"
              >
                <option value="GHS">GHS - Ghana Cedis</option>
                <option value="USD">USD - US Dollars</option>
                <option value="EUR">EUR - Euros</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">System Settings</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-primary-dark rounded-lg border border-gray-800">
              <div>
                <p className="text-white font-medium">Maintenance Mode</p>
                <p className="text-text-muted text-sm">Put the site in maintenance mode</p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-5 h-5"
              />
            </label>
            <label className="flex items-center justify-between p-4 bg-primary-dark rounded-lg border border-gray-800">
              <div>
                <p className="text-white font-medium">Allow New Registrations</p>
                <p className="text-text-muted text-sm">Allow new users to register</p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowRegistrations}
                onChange={(e) => setSettings({ ...settings, allowRegistrations: e.target.checked })}
                className="w-5 h-5"
              />
            </label>
            <label className="flex items-center justify-between p-4 bg-primary-dark rounded-lg border border-gray-800">
              <div>
                <p className="text-white font-medium">Require Email Verification</p>
                <p className="text-text-muted text-sm">Users must verify their email</p>
              </div>
              <input
                type="checkbox"
                checked={settings.requireEmailVerification}
                onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                className="w-5 h-5"
              />
            </label>
          </div>
        </div>

        {/* Financial Settings */}
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Financial Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Commission Rate (%)
              </label>
              <input
                type="number"
                value={settings.commissionRate}
                onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-purple"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-accent-purple text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

