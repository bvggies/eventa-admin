import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    storage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/events', label: 'Events', icon: '🎉' },
    { path: '/ticket-sales', label: 'Sales', icon: '💰' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-primary-dark">
      <nav className="bg-primary-card border-b border-accent-purple/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-white">Eventa</span>
                <span className="ml-2 text-sm text-text-muted">Admin</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === item.path
                        ? 'border-accent-purple text-white'
                        : 'border-transparent text-text-muted hover:text-white hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
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

