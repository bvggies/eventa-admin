import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { safetyApi } from '../services/api';

interface LayoutProps {
  isAdmin?: boolean;
  isOrganizer?: boolean;
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ isAdmin = false, isOrganizer = false }) => {
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

  // Navigation items based on role
  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      { path: isAdmin ? '/' : '/organizer', label: 'Dashboard', icon: '📊' },
      { path: '/events', label: 'Events', icon: '🎉' },
      { path: '/ticket-sales', label: 'Sales', icon: '💰' },
      { path: '/analytics', label: 'Analytics', icon: '📈' },
    ];
    
    // Safety alerts only for super admins
    if (isAdmin) {
      baseItems.push({ path: '/safety-alerts', label: 'Safety', icon: '🛡️', badge: true });
    }
    
    // Super admin only items
    if (isAdmin) {
      baseItems.push({ path: '/admin', label: 'Admin', icon: '👑' });
    }
    
    return baseItems;
  };
  
  const navItems = getNavItems();

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
                  <span className="text-xs text-text-muted leading-tight">
                    {isAdmin ? 'Admin Dashboard' : isOrganizer ? 'Organizer Dashboard' : 'Dashboard'}
                  </span>
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
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Safety Alert Button - Only for super admins */}
              {isAdmin && (
                <Link
                  to="/safety-alerts"
                  className="relative px-3 py-2 sm:px-4 text-sm font-medium text-white bg-red-500/20 hover:bg-red-500/30 rounded-lg border border-red-500/50 transition-all duration-200 hover:scale-105 flex items-center gap-1 sm:gap-2 min-w-[44px] sm:min-w-auto"
                  title="Safety Alerts"
                >
                  <span className="text-lg sm:text-xl">🚨</span>
                  <span className="hidden sm:inline">Safety Alerts</span>
                  {emergencyCount > 0 && (
                    <>
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full animate-pulse shadow-lg z-10">
                        {emergencyCount}
                      </span>
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                    </>
                  )}
                </Link>
              )}
              <Link
                to="/profile"
                className="hidden sm:block px-4 py-2 text-sm font-medium text-white hover:text-accent-purple transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:bg-red-600 transition-colors"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Out</span>
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

