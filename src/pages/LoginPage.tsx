import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { storage } from '../utils/storage';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [storageError, setStorageError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if localStorage is available on mount
    const checkStorage = () => {
      try {
        // Use a timeout to avoid blocking the UI
        setTimeout(() => {
          try {
            if (storage.isBlocked()) {
              setStorageError(true);
            }
          } catch (error) {
            // Storage check failed, but we'll use memory fallback
            // Don't log to console to avoid noise
          }
        }, 100);
      } catch (error) {
        // Ignore errors during storage check
      }
    };
    
    checkStorage();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStorageError(false);
    setLoading(true);

    // Check storage availability before attempting login (but don't block login)
    try {
      if (!storage.isAvailable()) {
        setStorageError(true);
        // Don't block login - just warn that storage is blocked
        // The app will use memory fallback
      }
    } catch (error) {
      // Storage check failed, but continue with login
      setStorageError(true);
    }

    try {
      console.log('Attempting login to:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');
      const response = await authApi.login(email, password);
      
      // Try to save token (will use memory fallback if localStorage is blocked)
      const success = storage.setItem('token', response.data.token);
      
      if (!success) {
        setError('Failed to save login token. The app will use temporary storage (session only).');
        // Still navigate - memory storage will work for this session
      }
      
      // Check if we're using fallback storage
      if (storage.isBlocked()) {
        setStorageError(true);
        // Show warning but still allow login with memory storage
        setTimeout(() => {
          setStorageError(false);
        }, 5000);
      }

      // Store user info including admin status
      if (response.data.user) {
        storage.setItem('user', JSON.stringify(response.data.user));
      }
      
      // Small delay for smooth transition
      setTimeout(() => {
        navigate('/');
      }, 300);
    } catch (err: any) {
      setLoading(false);
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error config:', err.config);
      
      if (err.code === 'ERR_BLOCKED_BY_CLIENT' || err.message?.includes('storage') || err.message?.includes('not allowed')) {
        setStorageError(true);
        setError('Browser storage is blocked. The app will use temporary storage for this session only. Please allow cookies/localStorage for persistent login.');
      } else if (err.response?.status === 401) {
        setError(err.response?.data?.error || 'Invalid email or password. Please check your credentials and try again.');
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError(`Cannot connect to server. Please check that the backend is running at ${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}`);
      } else {
        setError(err.response?.data?.error || err.message || 'Login failed. Please check your credentials and try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-teal/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent-purple/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="max-w-md w-full bg-primary-card/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-800/50 relative z-10 transform transition-all duration-500 hover:scale-[1.02]">
        <div className="text-center mb-8">
          {/* Animated Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-purple via-purple-600 to-accent-teal flex items-center justify-center shadow-2xl shadow-purple-500/50 transform transition-all duration-500 hover:scale-110 hover:rotate-3 overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="Eventa Logo" 
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    // Fallback to SVG logo if PNG fails
                    const target = e.target as HTMLImageElement;
                    target.src = '/logo.svg';
                    target.onerror = () => {
                      // Final fallback to text
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = '<span class="text-4xl font-bold text-white drop-shadow-lg">E</span>';
                      }
                    };
                  }}
                />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-teal opacity-50 blur-xl animate-pulse"></div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-accent-purple to-accent-teal bg-clip-text text-transparent animate-fade-in">
            Eventa Admin
          </h1>
          <p className="text-text-muted text-lg">Sign in to manage your events</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gradient-to-br from-accent-purple/10 to-accent-teal/10 border border-accent-purple/30 rounded-lg text-left backdrop-blur-sm animate-fade-in">
              <p className="text-xs text-text-muted mb-3 font-semibold uppercase tracking-wide">Development Credentials:</p>
              <div className="mb-3 p-2 bg-accent-purple/5 rounded border border-accent-purple/20">
                <p className="text-xs font-semibold text-accent-purple mb-1.5 flex items-center gap-1">
                  <span>👑</span> Super Admin
                </p>
                <p className="text-xs text-white font-mono">Email: admin@eventa.com</p>
                <p className="text-xs text-white font-mono">Password: admin123</p>
              </div>
              <div className="p-2 bg-accent-teal/5 rounded border border-accent-teal/20">
                <p className="text-xs font-semibold text-accent-teal mb-1.5 flex items-center gap-1">
                  <span>✅</span> Organizer
                </p>
                <p className="text-xs text-white font-mono">Email: organizer@eventa.com</p>
                <p className="text-xs text-white font-mono">Password: password123</p>
              </div>
            </div>
          )}
        </div>

        {storageError && (
          <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-400 text-sm">
            <p className="font-semibold mb-2">⚠️ Storage Access Blocked</p>
            <p className="mb-2">Your browser extensions are blocking localStorage. The app will work with temporary storage, but you'll need to login again after closing the browser.</p>
            <p className="mb-2 text-xs">To enable persistent login:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Click the extension icon (uBlock Origin, Privacy Badger, etc.) and disable for this site</li>
              <li>Or allow cookies/localStorage in browser settings</li>
              <li>Or try a different browser/incognito mode</li>
            </ul>
            <p className="mt-2 text-xs italic">You can still login - it will work for this session!</p>
          </div>
        )}

        {error && !storageError && (
          <div className="mb-4 p-3 bg-danger/20 border border-danger rounded-lg text-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
              focusedField === 'email' ? 'text-accent-purple' : 'text-white'
            }`}>
              Email
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-12 pr-4 py-3 bg-primary-dark border rounded-lg text-white transition-all duration-200 ${
                  focusedField === 'email'
                    ? 'border-accent-purple ring-2 ring-accent-purple/50 shadow-lg shadow-purple-500/20'
                    : 'border-gray-700 focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/50'
                }`}
                placeholder="admin@eventa.com"
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
              focusedField === 'password' ? 'text-accent-purple' : 'text-white'
            }`}>
              Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-12 pr-12 py-3 bg-primary-dark border rounded-lg text-white transition-all duration-200 ${
                  focusedField === 'password'
                    ? 'border-accent-purple ring-2 ring-accent-purple/50 shadow-lg shadow-purple-500/20'
                    : 'border-gray-700 focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/50'
                }`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-accent-purple to-accent-teal text-white py-3.5 rounded-lg font-semibold hover:opacity-90 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent-teal to-accent-purple opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </button>
        </form>
      </div>
    </div>
  );
};

