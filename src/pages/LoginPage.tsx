import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { storage } from '../utils/storage';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [storageError, setStorageError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if localStorage is available on mount
    if (!storage.isAvailable()) {
      setStorageError(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStorageError(false);

    // Check storage availability before attempting login
    if (!storage.isAvailable()) {
      setStorageError(true);
      setError('Browser storage is blocked. Please allow cookies/localStorage in your browser settings or disable privacy extensions.');
      return;
    }

    try {
      const response = await authApi.login(email, password);
      const success = storage.setItem('token', response.data.token);
      
      if (!success) {
        setStorageError(true);
        setError('Failed to save login token. Please check your browser settings and allow localStorage.');
        return;
      }
      
      navigate('/');
    } catch (err: any) {
      if (err.code === 'ERR_BLOCKED_BY_CLIENT' || err.message?.includes('storage')) {
        setStorageError(true);
        setError('Browser storage is blocked. Please allow cookies/localStorage in your browser settings.');
      } else {
        setError(err.response?.data?.error || 'Login failed. Please check your credentials and try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-primary-card rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Eventa Admin</h1>
          <p className="text-text-muted">Sign in to manage your events</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-accent-purple/10 border border-accent-purple/30 rounded-lg text-left">
              <p className="text-xs text-text-muted mb-2 font-semibold">Development Credentials:</p>
              <p className="text-xs text-white">Email: organizer@eventa.com</p>
              <p className="text-xs text-white">Password: password123</p>
            </div>
          )}
        </div>

        {storageError && (
          <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-400 text-sm">
            <p className="font-semibold mb-2">⚠️ Storage Access Required</p>
            <p className="mb-2">Your browser is blocking localStorage access. To fix this:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Disable privacy extensions (uBlock Origin, Privacy Badger, etc.) for this site</li>
              <li>Allow cookies and site data in browser settings</li>
              <li>If using incognito mode, try regular browsing mode</li>
              <li>Check browser privacy/security settings</li>
            </ul>
          </div>
        )}

        {error && !storageError && (
          <div className="mb-4 p-3 bg-danger/20 border border-danger rounded-lg text-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-purple"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-purple"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-accent-purple to-accent-teal text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

