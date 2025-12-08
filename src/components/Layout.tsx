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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="min-h-screen bg-primary-dark flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-primary-card border-r border-gray-800 transition-all duration-300 flex flex-col fixed h-screen z-40`}
      >
        {/* Logo and App Name */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-purple to-accent-teal flex items-center justify-center shadow-lg shadow-purple-500/30 overflow-hidden flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="Eventa Logo" 
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/logo.svg';
                  target.onerror = () => {
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.innerHTML = '<span class="text-2xl font-bold text-white">E</span>';
                    }
                  };
                }}
              />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-xl font-bold text-white leading-tight truncate">Eventa</span>
                <span className="text-xs text-text-muted leading-tight truncate">
                  {isAdmin ? 'Admin' : isOrganizer ? 'Organizer' : 'Dashboard'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative group ${
                  location.pathname === item.path
                    ? 'bg-accent-purple/20 text-white border-l-4 border-accent-purple'
                    : 'text-text-muted hover:text-white hover:bg-primary-dark'
                } ${item.path === '/safety-alerts' && emergencyCount > 0 ? 'animate-pulse' : ''}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.path === '/safety-alerts' && emergencyCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                        {emergencyCount}
                      </span>
                    )}
                  </>
                )}
                {!sidebarOpen && item.path === '/safety-alerts' && emergencyCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Bottom Section - Profile and Logout */}
        <div className="border-t border-gray-800 p-4 space-y-2">
          <Link
            to="/profile"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-text-muted hover:text-white hover:bg-primary-dark transition-all duration-200 ${
              location.pathname === '/profile' ? 'bg-accent-purple/20 text-white' : ''
            }`}
            title={!sidebarOpen ? 'Profile' : undefined}
          >
            <span className="text-xl flex-shrink-0">👤</span>
            {sidebarOpen && <span className="truncate">Profile</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white bg-danger hover:bg-red-600 transition-colors"
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <span className="text-xl flex-shrink-0">🚪</span>
            {sidebarOpen && <span className="truncate">Logout</span>}
          </button>
        </div>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-primary-card border border-gray-700 rounded-full flex items-center justify-center text-text-muted hover:text-white hover:bg-primary-dark transition-colors"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? '‹' : '›'}
        </button>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar - Only for Safety Alerts (Admin) */}
        {isAdmin && emergencyCount > 0 && (
          <div className="bg-red-500/10 border-b border-red-500/30 px-6 py-3">
            <Link
              to="/safety-alerts"
              className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors"
            >
              <span className="text-xl">🚨</span>
              <span className="font-medium">
                {emergencyCount} {emergencyCount === 1 ? 'emergency' : 'emergencies'} require attention
              </span>
              <span className="ml-auto text-sm">View →</span>
            </Link>
          </div>
        )}

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

