import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { eventsApi, authApi } from '../services/api';

export const TicketSalesPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserAndData();
  }, []);

  const loadUserAndData = async () => {
    try {
      // Get current user to check role and filter events
      const userResponse = await authApi.getCurrentUser();
      const currentUser = userResponse.data;
      setIsAdmin(currentUser.is_admin || false);
      setUserId(currentUser.id);

      // Load all events
      const response = await eventsApi.getAll();
      let allEvents = response.data;
      
      // If user is organizer (not admin), filter to show only their events
      if (!currentUser.is_admin && currentUser.is_organizer) {
        allEvents = allEvents.filter((e: any) => 
          e.organizer_id === currentUser.id || e.organizerId === currentUser.id
        );
      }
      
      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading ticket sales:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock ticket sales data
  const salesData = events.map((event) => ({
    name: (event.name || '').length > 15 ? (event.name || '').substring(0, 15) + '...' : (event.name || 'Unnamed Event'),
    tickets: Math.floor(Math.random() * 100) + 10,
    revenue: (Math.floor(Math.random() * 100) + 10) * (event.ticket_price || 0),
  }));

  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
  const totalTickets = salesData.reduce((sum, item) => sum + item.tickets, 0);

  // Time series data (mock)
  const timeSeriesData = [
    { date: 'Week 1', sales: 45, revenue: 1350 },
    { date: 'Week 2', sales: 52, revenue: 1560 },
    { date: 'Week 3', sales: 48, revenue: 1440 },
    { date: 'Week 4', sales: 61, revenue: 1830 },
  ];

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="text-white text-center py-12">Loading ticket sales...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Ticket Sales</h1>
          {!isAdmin && (
            <p className="text-text-muted mt-1">Your events sales</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-4 py-2 rounded-lg ${
              selectedPeriod === 'week'
                ? 'bg-accent-purple text-white'
                : 'bg-primary-dark text-text-muted'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-lg ${
              selectedPeriod === 'month'
                ? 'bg-accent-purple text-white'
                : 'bg-primary-dark text-text-muted'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setSelectedPeriod('year')}
            className={`px-4 py-2 rounded-lg ${
              selectedPeriod === 'year'
                ? 'bg-accent-purple text-white'
                : 'bg-primary-dark text-text-muted'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <div className="text-text-muted text-sm mb-2">Total Revenue</div>
          <div className="text-3xl font-bold text-white">
            ₵{totalRevenue.toLocaleString()}
          </div>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <div className="text-text-muted text-sm mb-2">Tickets Sold</div>
          <div className="text-3xl font-bold text-white">{totalTickets.toLocaleString()}</div>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <div className="text-text-muted text-sm mb-2">Average Price</div>
          <div className="text-3xl font-bold text-white">
            ₵{totalTickets > 0 ? (totalRevenue / totalTickets).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Over Time */}
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Sales Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2F36" />
              <XAxis dataKey="date" stroke="#A3A3A3" />
              <YAxis stroke="#A3A3A3" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F1724',
                  border: '1px solid #2A2F36',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#FFFFFF' }}
              />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#7C3AED" name="Tickets" />
              <Line type="monotone" dataKey="revenue" stroke="#06B6D4" name="Revenue (₵)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Event */}
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Revenue by Event</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2F36" />
              <XAxis dataKey="name" stroke="#A3A3A3" />
              <YAxis stroke="#A3A3A3" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F1724',
                  border: '1px solid #2A2F36',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#FFFFFF' }}
              />
              <Bar dataKey="revenue" fill="#7C3AED" name="Revenue (₵)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">Event Sales Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-white font-semibold">Event</th>
                <th className="text-left py-3 px-4 text-white font-semibold">Tickets Sold</th>
                <th className="text-left py-3 px-4 text-white font-semibold">Revenue</th>
                <th className="text-left py-3 px-4 text-white font-semibold">Avg Price</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((item, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-primary-dark">
                  <td className="py-3 px-4 text-white">{item.name}</td>
                  <td className="py-3 px-4 text-white">{item.tickets}</td>
                  <td className="py-3 px-4 text-white">₵{item.revenue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-white">
                    ₵{(item.revenue / item.tickets).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

