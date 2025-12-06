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
            console.warn('Could not verify admin status:', error);
            setIsAdmin(false);
          }
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.warn('Error checking authentication:', error);
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
            setIsAdmin(false);
          }
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    };

    // Check auth state periodically (for memory storage fallback)
    const interval = setInterval(handleStorageChange, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="text-white">Loading...</div>
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
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
