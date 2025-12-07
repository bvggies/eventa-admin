import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { safetyApi } from '../services/api';

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [emergencyCount, setEmergencyCount] = useState(0);

  useEffect(() => {
    const loadEmergencyCount = async () => {
      try {
        const response = await safetyApi.getUnacknowledgedEmergencies();
        setEmergencyCount(response.data.length);
      } catch (error) {
        // Silently handle errors
      }
    };

    loadEmergencyCount();
    const interval = setInterval(loadEmergencyCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    storage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/events', label: 'Events', icon: '🎉' },
    { path: '/ticket-sales', label: 'Sales', icon: '💰' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/safety-alerts', label: 'Safety', icon: '🛡️', badge: true },
    { path: '/admin', label: 'Admin', icon: '👑' },
  ];

  return (
    <div className="min-h-screen bg-primary-dark">
      <nav className="bg-primary-card border-b border-accent-purple/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-purple to-accent-teal flex items-center justify-center shadow-lg shadow-purple-500/30 overflow-hidden">
                  <img 
                    src="/logo.png" 
                    alt="Eventa Logo" 
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      // Fallback to SVG logo if PNG fails
                      const target = e.target as HTMLImageElement;
                      target.src = '/logo.svg';
                      target.onerror = () => {
                        // Final fallback to text
                        target.style.display = 'none';
                        if (target.parentElement) {
                          target.parentElement.innerHTML = '<span class="text-xl font-bold text-white">E</span>';
                        }
                      };
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white leading-tight">Eventa</span>
                  <span className="text-xs text-text-muted leading-tight">Admin Dashboard</span>
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-all duration-200 relative ${
                      location.pathname === item.path
                        ? 'border-accent-purple text-white'
                        : 'border-transparent text-text-muted hover:text-white hover:border-accent-purple/50'
                    } ${item.path === '/safety-alerts' && emergencyCount > 0 ? 'animate-pulse' : ''}`}
                  >
                    <span className="mr-2 text-lg">{item.icon}</span>
                    {item.label}
                    {item.path === '/safety-alerts' && emergencyCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {emergencyCount}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="px-4 py-2 text-sm font-medium text-white hover:text-accent-purple transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

