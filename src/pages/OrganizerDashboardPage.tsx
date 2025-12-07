import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi, authApi } from '../services/api';
import { storage } from '../utils/storage';

type TimeRange = 'today' | '7days' | '30days' | 'alltime';

export const OrganizerDashboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('alltime');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRSVPs: 0,
    totalViews: 0,
    totalRevenue: 0,
    totalTickets: 0,
  });

  useEffect(() => {
    loadUserAndData();
  }, [timeRange]);

  const loadUserAndData = async () => {
    try {
      // Get current user to filter events
      const userResponse = await authApi.getCurrentUser();
      const currentUser = userResponse.data;
      setUserId(currentUser.id);

      // Load all events and filter by organizer
      const eventsResponse = await eventsApi.getAll();
      const allEvents = eventsResponse.data;
      
      // Filter events by current organizer
      const myEvents = allEvents.filter((e: any) => 
        e.organizer_id === currentUser.id || e.organizerId === currentUser.id
      );
      
      setEvents(myEvents);

      // Calculate stats based on time range
      const filteredEvents = filterEventsByTimeRange(myEvents, timeRange);
      
      const totalRSVPs = filteredEvents.reduce((sum: number, e: any) => sum + (e.rsvps || 0), 0);
      const totalViews = filteredEvents.reduce((sum: number, e: any) => sum + (e.views || 0), 0);
      const totalRevenue = filteredEvents.reduce((sum: number, e: any) => {
        const ticketPrice = e.ticket_price || 0;
        const ticketsSold = Math.floor((e.rsvps || 0) * 0.5); // Estimate 50% conversion
        return sum + (ticketPrice * ticketsSold);
      }, 0);
      const totalTickets = filteredEvents.reduce((sum: number, e: any) => 
        sum + Math.floor((e.rsvps || 0) * 0.5), 0
      );

      setStats({
        totalEvents: filteredEvents.length,
        totalRSVPs,
        totalViews,
        totalRevenue,
        totalTickets,
      });
    } catch (error) {
      console.error('Error loading organizer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEventsByTimeRange = (eventsList: any[], range: TimeRange) => {
    if (range === 'alltime') return eventsList;
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (range) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        filterDate.setDate(now.getDate() - 30);
        break;
    }
    
    return eventsList.filter((e: any) => {
      const eventDate = new Date(e.created_at || e.date);
      return eventDate >= filterDate;
    });
  };

  // Get top performing events
  const topEvents = events
    .map((e: any) => ({
      ...e,
      engagement: (e.views || 0) + (e.rsvps || 0) * 2 + (e.likes || 0) + (e.saves || 0),
    }))
    .sort((a: any, b: any) => b.engagement - a.engagement)
    .slice(0, 5);

  // Recent events
  const recentEvents = [...events]
    .sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || a.date || 0);
      const dateB = new Date(b.created_at || b.date || 0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'today', label: '📆 Today' },
    { value: '7days', label: '7 Days' },
    { value: '30days', label: '30 Days' },
    { value: 'alltime', label: 'All Time' },
  ];

  const statCards = [
    { 
      label: 'Total Events', 
      value: stats.totalEvents, 
      icon: '🎉', 
      color: 'accent-purple',
      bgGradient: 'from-purple-500/20 to-purple-600/10',
    },
    { 
      label: 'Total Views', 
      value: stats.totalViews.toLocaleString(), 
      icon: '👁️', 
      color: 'accent-teal',
      bgGradient: 'from-teal-500/20 to-teal-600/10',
    },
    { 
      label: 'Total RSVPs', 
      value: stats.totalRSVPs.toLocaleString(), 
      icon: '✋', 
      color: 'accent-gold',
      bgGradient: 'from-yellow-500/20 to-yellow-600/10',
    },
    { 
      label: 'Total Revenue', 
      value: `GHS ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: '💳', 
      color: 'success',
      bgGradient: 'from-green-500/20 to-green-600/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Organizer Dashboard</h1>
          <p className="text-text-muted mt-1">Manage your events and track performance</p>
        </div>
        <Link
          to="/events/create"
          className="bg-gradient-to-r from-accent-purple to-accent-teal text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-200 hover:scale-105 shadow-lg shadow-purple-500/20"
        >
          + Create Event
        </Link>
      </div>

      {/* Time Range Filter */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-text-muted text-sm">Time Range:</span>
        {timeRangeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setTimeRange(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              timeRange === option.value
                ? 'bg-accent-purple text-white shadow-lg shadow-purple-500/30'
                : 'bg-primary-card text-text-muted hover:bg-gray-800 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{stat.icon}</span>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.bgGradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-xl">📊</span>
              </div>
            </div>
            <h3 className="text-text-muted text-sm mb-1">{stat.label}</h3>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Performing Events */}
        <div className="lg:col-span-2 bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🔥</span> Top Performing Events
          </h2>
          {topEvents.length > 0 ? (
            <div className="space-y-4">
              {topEvents.map((event: any, index: number) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}/edit`}
                  className="block p-4 bg-primary-dark rounded-lg border border-gray-800 hover:border-accent-purple/50 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-accent-purple">#{index + 1}</span>
                        <h4 className="text-white font-semibold">{event.name}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-text-muted">
                        <span>👁️ {event.views || 0} views</span>
                        <span>✋ {event.rsvps || 0} RSVPs</span>
                        <span>💳 GHS {((event.ticket_price || 0) * Math.floor((event.rsvps || 0) * 0.5)).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-accent-purple font-bold text-lg">
                        {event.engagement.toLocaleString()}
                      </div>
                      <div className="text-text-muted text-xs">Engagement</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-text-muted">No events yet</p>
              <Link
                to="/events/create"
                className="mt-4 inline-block bg-accent-purple text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Create Your First Event
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>⚡</span> Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/events/create"
              className="block p-4 bg-primary-dark rounded-lg border border-gray-700 hover:border-accent-purple transition-all duration-200 hover:scale-105 cursor-pointer group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">➕</div>
              <div className="text-white font-semibold">Create Event</div>
              <div className="text-text-muted text-sm">Add a new event</div>
            </Link>
            <Link
              to="/events"
              className="block p-4 bg-primary-dark rounded-lg border border-gray-700 hover:border-accent-purple transition-all duration-200 hover:scale-105 cursor-pointer group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">📋</div>
              <div className="text-white font-semibold">Manage Events</div>
              <div className="text-text-muted text-sm">View all events</div>
            </Link>
            <Link
              to="/analytics"
              className="block p-4 bg-primary-dark rounded-lg border border-gray-700 hover:border-accent-purple transition-all duration-200 hover:scale-105 cursor-pointer group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">📈</div>
              <div className="text-white font-semibold">View Analytics</div>
              <div className="text-text-muted text-sm">See insights</div>
            </Link>
            <Link
              to="/ticket-sales"
              className="block p-4 bg-primary-dark rounded-lg border border-gray-700 hover:border-accent-purple transition-all duration-200 hover:scale-105 cursor-pointer group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">🎫</div>
              <div className="text-white font-semibold">Ticket Sales</div>
              <div className="text-text-muted text-sm">Track sales</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800 mb-8 transition-all duration-300 hover:shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📋</span> Recent Events
          </h2>
          <Link
            to="/events"
            className="text-accent-purple text-sm font-medium hover:underline"
          >
            View All →
          </Link>
        </div>
        {recentEvents.length > 0 ? (
          <div className="space-y-4">
            {recentEvents.map((event: any) => (
              <Link
                key={event.id}
                to={`/events/${event.id}/edit`}
                className="block p-4 bg-primary-dark rounded-lg border border-gray-800 hover:border-accent-purple/50 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-lg mb-1">{event.name}</h4>
                    <p className="text-text-muted text-sm mb-2">{event.location}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-text-muted">
                        📅 {new Date(event.date || event.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-text-muted">👁️ {event.views || 0} views</span>
                      <span className="text-text-muted">✋ {event.rsvps || 0} RSVPs</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {event.is_featured && (
                      <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold mb-2">
                        ⭐ Featured
                      </span>
                    )}
                    <div className="text-accent-purple font-semibold">
                      GHS {(event.ticket_price || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-text-muted mb-4">No events yet</p>
            <Link
              to="/events/create"
              className="inline-block bg-accent-purple text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Create Your First Event
            </Link>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>📊</span> Conversion Rate
          </h3>
          <div className="text-4xl font-bold text-accent-purple mb-2">
            {stats.totalViews > 0 
              ? ((stats.totalRSVPs / stats.totalViews) * 100).toFixed(1)
              : '0.0'
            }%
          </div>
          <p className="text-text-muted text-sm">RSVP to View ratio</p>
        </div>

        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🎫</span> Ticket Sales
          </h3>
          <div className="text-4xl font-bold text-accent-teal mb-2">
            {stats.totalTickets.toLocaleString()}
          </div>
          <p className="text-text-muted text-sm">Estimated tickets sold</p>
        </div>

        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>💰</span> Avg Revenue/Event
          </h3>
          <div className="text-4xl font-bold text-success mb-2">
            GHS {stats.totalEvents > 0 
              ? (stats.totalRevenue / stats.totalEvents).toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })
              : '0.00'
            }
          </div>
          <p className="text-text-muted text-sm">Average per event</p>
        </div>
      </div>
    </div>
  );
};

