import React from 'react';
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
  // Safely check for authentication token
  const isAuthenticated = storage.getItem('token') !== null;

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
