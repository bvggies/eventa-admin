import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage';
import { EventsPage } from './pages/EventsPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { EditEventPage } from './pages/EditEventPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AttendeesPage } from './pages/AttendeesPage';
import { TicketSalesPage } from './pages/TicketSalesPage';
import { AdminManagementPage } from './pages/AdminManagementPage';
import { AdminProfilePage } from './pages/AdminProfilePage';
import { PlatformModerationPage } from './pages/PlatformModerationPage';
import { FinancialControlPage } from './pages/FinancialControlPage';
import { PlatformSettingsPage } from './pages/PlatformSettingsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { BulkOperationsPage } from './pages/BulkOperationsPage';
import { SystemHealthPage } from './pages/SystemHealthPage';
import { SafetyAlertsPage } from './pages/SafetyAlertsPage';
import { LocationMonitoringPage } from './pages/LocationMonitoringPage';
import { Layout } from './components/Layout';
import { storage } from './utils/storage';

function App() {
  // Safely check for authentication token (works with localStorage or memory fallback)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = async () => {
      try {
        const token = storage.getItem('token');
        if (token) {
          // Verify admin and organizer status
          try {
            const { authApi } = await import('./services/api');
            const response = await authApi.getCurrentUser();
            const isAdminUser = response.data.is_admin || false;
            const isOrganizerUser = response.data.is_organizer || false;
            
            // Only allow access if user is admin or organizer
            if (isAdminUser || isOrganizerUser) {
              setIsAuthenticated(true);
              setIsAdmin(isAdminUser);
              setIsOrganizer(isOrganizerUser);
            } else {
              // Regular user - deny access and redirect to login
              setIsAuthenticated(false);
              setIsAdmin(false);
              setIsOrganizer(false);
              storage.removeItem('token');
              storage.removeItem('user');
              // Redirect will happen via routing
            }
          } catch (error) {
            // If verification fails, deny access
            setIsAuthenticated(false);
            setIsAdmin(false);
            setIsOrganizer(false);
            storage.removeItem('token');
            storage.removeItem('user');
          }
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsOrganizer(false);
        }
      } catch (error) {
        // Silently handle storage access errors
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsOrganizer(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = async () => {
      try {
        const token = storage.getItem('token');
        if (token) {
          // Verify admin and organizer status
          try {
            const { authApi } = await import('./services/api');
            const response = await authApi.getCurrentUser();
            const isAdminUser = response.data.is_admin || false;
            const isOrganizerUser = response.data.is_organizer || false;
            
            // Only allow access if user is admin or organizer
            if (isAdminUser || isOrganizerUser) {
              setIsAuthenticated(true);
              setIsAdmin(isAdminUser);
              setIsOrganizer(isOrganizerUser);
            } else {
              // Regular user - deny access
              setIsAuthenticated(false);
              setIsAdmin(false);
              setIsOrganizer(false);
              storage.removeItem('token');
              storage.removeItem('user');
            }
          } catch (error) {
            // If verification fails, deny access
            setIsAuthenticated(false);
            setIsAdmin(false);
            setIsOrganizer(false);
            storage.removeItem('token');
            storage.removeItem('user');
          }
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsOrganizer(false);
        }
      } catch (error) {
        // Silently handle storage access errors
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsOrganizer(false);
      }
    };

    // Check auth state periodically (for memory storage fallback)
    const interval = setInterval(handleStorageChange, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update document title
    document.title = 'Eventa Admin Dashboard';
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-purple to-accent-teal flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse">
            <span className="text-3xl font-bold text-white">E</span>
          </div>
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {isAuthenticated && (isAdmin || isOrganizer) ? (
          <Route path="/" element={<Layout isAdmin={isAdmin} isOrganizer={isOrganizer} />}>
            {/* Root redirect based on role */}
            <Route index element={
              isAdmin ? <DashboardPage /> : 
              isOrganizer ? <Navigate to="/organizer" replace /> : 
              <Navigate to="/login" replace />
            } />
            
            {/* Organizer Dashboard - Only accessible to organizers */}
            <Route path="organizer" element={
              isOrganizer ? <OrganizerDashboardPage /> : <Navigate to="/login" replace />
            } />
            
            {/* Super Admin Only Routes */}
            <Route path="admin" element={isAdmin ? <AdminManagementPage /> : <Navigate to="/login" replace />} />
            <Route path="moderation" element={isAdmin ? <PlatformModerationPage /> : <Navigate to="/login" replace />} />
            <Route path="financial" element={isAdmin ? <FinancialControlPage /> : <Navigate to="/login" replace />} />
            <Route path="settings" element={isAdmin ? <PlatformSettingsPage /> : <Navigate to="/login" replace />} />
            <Route path="audit-logs" element={isAdmin ? <AuditLogsPage /> : <Navigate to="/login" replace />} />
            <Route path="bulk-operations" element={isAdmin ? <BulkOperationsPage /> : <Navigate to="/login" replace />} />
            <Route path="system-health" element={isAdmin ? <SystemHealthPage /> : <Navigate to="/login" replace />} />
            <Route path="location-monitoring" element={isAdmin ? <LocationMonitoringPage /> : <Navigate to="/login" replace />} />
            
            {/* Shared Routes (both admin and organizer) */}
            <Route path="events" element={<EventsPage />} />
            <Route path="events/create" element={<CreateEventPage />} />
            <Route path="events/:id/edit" element={<EditEventPage />} />
            <Route path="events/:eventId/attendees" element={<AttendeesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="ticket-sales" element={<TicketSalesPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
            {/* Safety alerts only for super admins */}
            <Route path="safety-alerts" element={isAdmin ? <SafetyAlertsPage /> : <Navigate to={isOrganizer ? "/organizer" : "/"} replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
