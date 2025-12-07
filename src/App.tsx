import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = async () => {
      try {
        const token = storage.getItem('token');
        if (token) {
          setIsAuthenticated(true);
          // Verify admin status
          try {
            const { authApi } = await import('./services/api');
            const response = await authApi.getCurrentUser();
            setIsAdmin(response.data.is_admin || false);
          } catch (error) {
            // If verification fails, still allow access but mark as non-admin
            // Silently handle - don't log to console
            setIsAdmin(false);
          }
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        // Silently handle storage access errors
        setIsAuthenticated(false);
        setIsAdmin(false);
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
          setIsAuthenticated(true);
          // Verify admin status
          try {
            const { authApi } = await import('./services/api');
            const response = await authApi.getCurrentUser();
            setIsAdmin(response.data.is_admin || false);
          } catch (error) {
            // Silently handle auth verification errors
            setIsAdmin(false);
          }
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        // Silently handle storage access errors
        setIsAuthenticated(false);
        setIsAdmin(false);
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
        {isAuthenticated ? (
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/create" element={<CreateEventPage />} />
            <Route path="events/:id/edit" element={<EditEventPage />} />
            <Route path="events/:eventId/attendees" element={<AttendeesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="ticket-sales" element={<TicketSalesPage />} />
            <Route path="admin" element={<AdminManagementPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
            <Route path="moderation" element={<PlatformModerationPage />} />
            <Route path="financial" element={<FinancialControlPage />} />
            <Route path="settings" element={<PlatformSettingsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="bulk-operations" element={<BulkOperationsPage />} />
            <Route path="system-health" element={<SystemHealthPage />} />
            <Route path="safety-alerts" element={<SafetyAlertsPage />} />
            <Route path="location-monitoring" element={<LocationMonitoringPage />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
