import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../services/api';

type TimeRange = 'today' | '7days' | '30days' | 'alltime';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success';
  message: string;
  icon: string;
}

interface Activity {
  id: string;
  type: 'rsvp' | 'ticket' | 'event' | 'comment';
  message: string;
  time: string;
  icon: string;
}

export const DashboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('alltime');
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalViews: 0,
    totalRSVPs: 0,
    totalTickets: 0,
    ticketsCapacity: 100,
    totalRevenue: 0,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [topEvent, setTopEvent] = useState<any>(null);
  const [mostSearchedCity, setMostSearchedCity] = useState<string>('Accra');
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [conversionData, setConversionData] = useState({
    views: 0,
    rsvps: 0,
    tickets: 0,
  });

  useEffect(() => {
    loadStats();
    loadNotifications();
    loadRecentActivity();
    loadQuickAnalytics();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      const response = await eventsApi.getAll();
      const events = response.data;
      
      // Calculate revenue (assuming average ticket price)
      const totalRevenue = events.reduce((sum: number, e: any) => {
        const ticketPrice = e.ticket_price || 0;
        const ticketsSold = Math.floor((e.rsvps || 0) * 0.5); // Estimate 50% conversion
        return sum + (ticketPrice * ticketsSold);
      }, 0);

      setStats({
        totalEvents: events.length,
        totalViews: events.reduce((sum: number, e: any) => sum + (e.views || 0), 0),
        totalRSVPs: events.reduce((sum: number, e: any) => sum + (e.rsvps || 0), 0),
        totalTickets: events.reduce((sum: number, e: any) => Math.floor((e.rsvps || 0) * 0.5), 0),
        ticketsCapacity: events.reduce((sum: number, e: any) => sum + 100, 0), // Estimate capacity
        totalRevenue,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadNotifications = () => {
    // Mock notifications - replace with API call
    setNotifications([
      {
        id: '1',
        type: 'info',
        message: '3 events awaiting approval',
        icon: '🔔',
      },
      {
        id: '2',
        type: 'warning',
        message: 'Low sales on "Afro Night Party"',
        icon: '⚠️',
      },
      {
        id: '3',
        type: 'success',
        message: '120 RSVPs today',
        icon: '🔥',
      },
    ]);
  };

  const loadRecentActivity = () => {
    // Mock activity - replace with API call
    setRecentActivity([
      {
        id: '1',
        type: 'ticket',
        message: 'Ama bought VIP ticket for AfroJam',
        time: '5m ago',
        icon: '💳',
      },
      {
        id: '2',
        type: 'rsvp',
        message: 'Kofi RSVPed to TechConf2025',
        time: '12m ago',
        icon: '✋',
      },
      {
        id: '3',
        type: 'event',
        message: 'Beach Party event updated',
        time: '1h ago',
        icon: '📅',
      },
      {
        id: '4',
        type: 'comment',
        message: 'New comment on "Osu Night Vibes"',
        time: '2h ago',
        icon: '💬',
      },
    ]);
  };

  const loadQuickAnalytics = async () => {
    try {
      const response = await eventsApi.getAll();
      const events = response.data;
      
      // Top event of the week
      const topEventData = events
        .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))[0];
      setTopEvent(topEventData);

      // Conversion funnel
      const totalViews = events.reduce((sum: number, e: any) => sum + (e.views || 0), 0);
      const totalRSVPs = events.reduce((sum: number, e: any) => sum + (e.rsvps || 0), 0);
      const totalTickets = events.reduce((sum: number, e: any) => Math.floor((e.rsvps || 0) * 0.5), 0);
      
      setConversionData({
        views: totalViews,
        rsvps: totalRSVPs,
        tickets: totalTickets,
      });

      // Trending tags (mock - would come from buzz API)
      setTrendingTags(['#GhanaEvents', '#LabadiParty', '#AccraNight', '#Afrobeats']);
    } catch (error) {
      console.error('Error loading quick analytics:', error);
    }
  };

  const ticketProgress = stats.ticketsCapacity > 0 
    ? (stats.totalTickets / stats.ticketsCapacity) * 100 
    : 0;

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
      value: stats.totalViews, 
      icon: '👁️', 
      color: 'accent-teal',
      bgGradient: 'from-teal-500/20 to-teal-600/10',
    },
    { 
      label: 'Total RSVPs', 
      value: stats.totalRSVPs, 
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

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
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

      {/* Notifications Banner */}
      {notifications.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border ${
                notif.type === 'info'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : notif.type === 'warning'
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                  : 'bg-green-500/10 border-green-500/30 text-green-400'
              } transition-all duration-200 hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{notif.icon}</span>
                <span className="text-sm font-medium">{notif.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards with Hover Effects */}
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

      {/* Tickets Sold with Progress Indicator */}
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800 mb-8 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🎫</span> Tickets Sold
          </h2>
          <span className="text-text-muted text-sm">
            {stats.totalTickets}/{stats.ticketsCapacity} seats
          </span>
        </div>
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-white">{stats.totalTickets}</span>
            <span className="text-text-muted">({ticketProgress.toFixed(0)}%)</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-purple to-accent-teal transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(ticketProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Analytics Widgets */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Event */}
          {topEvent && (
            <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>🔥</span> Top Event This Week
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-lg">{topEvent.name}</p>
                  <p className="text-text-muted text-sm">{topEvent.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-accent-purple font-bold text-xl">{topEvent.views || 0}</p>
                  <p className="text-text-muted text-xs">views</p>
                </div>
              </div>
            </div>
          )}

          {/* Conversion Funnel */}
          <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>📊</span> Conversion Funnel
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Views</span>
                <span className="text-white font-semibold">{conversionData.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">RSVPs</span>
                <span className="text-white font-semibold">{conversionData.rsvps.toLocaleString()}</span>
                <span className="text-accent-teal text-sm">
                  ({((conversionData.rsvps / conversionData.views) * 100 || 0).toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Tickets</span>
                <span className="text-white font-semibold">{conversionData.tickets.toLocaleString()}</span>
                <span className="text-accent-purple text-sm">
                  ({((conversionData.tickets / conversionData.rsvps) * 100 || 0).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Most Searched City */}
          <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>📍</span> Most Active City
            </h3>
            <p className="text-2xl font-bold text-accent-teal">{mostSearchedCity}</p>
          </div>

          {/* Trending Tags */}
          <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>🔥</span> Trending Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-accent-purple/20 text-accent-purple rounded-full text-sm font-medium border border-accent-purple/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800 mb-8 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>📋</span> Recent Activity
        </h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-4 bg-primary-dark rounded-lg border border-gray-800 hover:border-accent-purple/50 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
            >
              <span className="text-2xl">{activity.icon}</span>
              <div className="flex-1">
                <p className="text-white font-medium">{activity.message}</p>
              </div>
              <span className="text-text-muted text-sm">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/events/create"
            className="p-4 bg-primary-dark rounded-lg border border-gray-700 hover:border-accent-purple transition-all duration-200 hover:scale-105 cursor-pointer group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">➕</div>
            <div className="text-white font-semibold">Create Event</div>
            <div className="text-text-muted text-sm">Add a new event</div>
          </Link>
          <Link
            to="/events"
            className="p-4 bg-primary-dark rounded-lg border border-gray-700 hover:border-accent-purple transition-all duration-200 hover:scale-105 cursor-pointer group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">📋</div>
            <div className="text-white font-semibold">Manage Events</div>
            <div className="text-text-muted text-sm">View all events</div>
          </Link>
          <Link
            to="/analytics"
            className="p-4 bg-primary-dark rounded-lg border border-gray-700 hover:border-accent-purple transition-all duration-200 hover:scale-105 cursor-pointer group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">📈</div>
            <div className="text-white font-semibold">View Analytics</div>
            <div className="text-text-muted text-sm">See insights</div>
          </Link>
        </div>
      </div>
    </div>
  );
};
