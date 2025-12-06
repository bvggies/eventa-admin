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
import { Layout } from './components/Layout';
import { storage } from './utils/storage';

function App() {
  // Safely check for authentication token (works with localStorage or memory fallback)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    try {
      const token = storage.getItem('token');
      setIsAuthenticated(token !== null);
    } catch (error) {
      console.warn('Error checking authentication:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }

    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = () => {
      try {
        const token = storage.getItem('token');
        setIsAuthenticated(token !== null);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    // Check auth state periodically (for memory storage fallback)
    const interval = setInterval(handleStorageChange, 1000);

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
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
