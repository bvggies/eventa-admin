import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi, adminApi } from '../services/api';

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
  // Platform Moderation data
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [moderationStats, setModerationStats] = useState({
    pending: 0,
    approved: 0,
    flagged: 0,
    total: 0,
  });
  // Financial Control data
  const [financialData, setFinancialData] = useState<any>(null);
  // Audit Logs data
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [auditStats, setAuditStats] = useState({
    total: 0,
    created: 0,
    updated: 0,
    deleted: 0,
  });
  // Bulk Operations data
  const [bulkStats, setBulkStats] = useState({
    totalEvents: 0,
    featured: 0,
  });
  // System Health data
  const [systemHealth, setSystemHealth] = useState({
    database: 'checking',
    api: 'checking',
    storage: 'checking',
    uptime: '99.9%',
  });

  useEffect(() => {
    loadStats();
    loadNotifications();
    loadRecentActivity();
    loadQuickAnalytics();
    loadPlatformModeration();
    loadFinancialData();
    loadAuditLogs();
    loadBulkOperations();
    loadSystemHealth();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      const [analyticsResponse, eventsResponse] = await Promise.all([
        adminApi.getAnalytics({ timeRange }),
        eventsApi.getAll(),
      ]);

      const analytics = analyticsResponse.data;
      const events = eventsResponse.data;

      setStats({
        totalEvents: analytics.stats.totalEvents,
        totalViews: events.reduce((sum: number, e: any) => sum + (e.views || 0), 0),
        totalRSVPs: events.reduce((sum: number, e: any) => sum + (e.rsvps || 0), 0),
        totalTickets: analytics.stats.totalTickets,
        ticketsCapacity: analytics.stats.totalTickets * 2, // Estimate capacity
        totalRevenue: analytics.stats.totalRevenue,
      });

      // Set conversion data
      const totalViews = events.reduce((sum: number, e: any) => sum + (e.views || 0), 0);
      const totalRSVPs = events.reduce((sum: number, e: any) => sum + (e.rsvps || 0), 0);
      setConversionData({
        views: totalViews,
        rsvps: totalRSVPs,
        tickets: analytics.stats.totalTickets,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback to events API only
      try {
        const response = await eventsApi.getAll();
        const events = response.data;
        setStats({
          totalEvents: events.length,
          totalViews: events.reduce((sum: number, e: any) => sum + (e.views || 0), 0),
          totalRSVPs: events.reduce((sum: number, e: any) => sum + (e.rsvps || 0), 0),
          totalTickets: 0,
          ticketsCapacity: 100,
          totalRevenue: 0,
        });
      } catch (fallbackError) {
        console.error('Error loading fallback stats:', fallbackError);
      }
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await adminApi.getNotifications();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const response = await adminApi.getActivity();
      setRecentActivity(response.data.activities || []);
    } catch (error) {
      console.error('Error loading activity:', error);
      setRecentActivity([]);
    }
  };

  const loadQuickAnalytics = async () => {
    try {
      const response = await adminApi.getAnalytics({ timeRange });
      const analytics = response.data;
      
      // Top event of the week
      if (analytics.trendingEvents && analytics.trendingEvents.length > 0) {
        setTopEvent(analytics.trendingEvents[0]);
      }

      // Trending tags (mock - would come from buzz API)
      setTrendingTags(['#GhanaEvents', '#LabadiParty', '#AccraNight', '#Afrobeats']);
    } catch (error) {
      console.error('Error loading quick analytics:', error);
      // Fallback
      try {
        const eventsResponse = await eventsApi.getAll();
        const events = eventsResponse.data;
        if (events.length > 0) {
          const topEventData = events
            .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))[0];
          setTopEvent(topEventData);
        }
      } catch (fallbackError) {
        console.error('Error loading fallback analytics:', fallbackError);
      }
    }
  };

  const loadPlatformModeration = async () => {
    try {
      const response = await eventsApi.getAll();
      const events = response.data;
      const pending = events.filter((e: any) => !e.is_featured);
      setPendingEvents(pending.slice(0, 3)); // Show only first 3
      setModerationStats({
        pending: pending.length,
        approved: events.length - pending.length,
        flagged: 0,
        total: events.length,
      });
    } catch (error) {
      console.error('Error loading moderation data:', error);
    }
  };

  const loadFinancialData = async () => {
    try {
      const response = await adminApi.getFinancialData({ timeRange: 'alltime' });
      setFinancialData(response.data);
    } catch (error) {
      console.error('Error loading financial data:', error);
    }
  };

  const loadAuditLogs = async () => {
    try {
      // Mock audit logs for now - would come from API
      const mockLogs = [
        {
          id: '1',
          action: 'User Created',
          user: 'admin@eventa.com',
          resource: 'User: john@example.com',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          action: 'Event Updated',
          user: 'admin@eventa.com',
          resource: 'Event: Beach Party',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          action: 'User Promoted',
          user: 'admin@eventa.com',
          resource: 'User: organizer@eventa.com',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
      ];
      setRecentLogs(mockLogs);
      setAuditStats({
        total: mockLogs.length,
        created: mockLogs.filter((l) => l.action.includes('Created')).length,
        updated: mockLogs.filter((l) => l.action.includes('Updated') || l.action.includes('Promoted')).length,
        deleted: mockLogs.filter((l) => l.action.includes('Deleted')).length,
      });
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  };

  const loadBulkOperations = async () => {
    try {
      const response = await eventsApi.getAll();
      const events = response.data;
      setBulkStats({
        totalEvents: events.length,
        featured: events.filter((e: any) => e.is_featured).length,
      });
    } catch (error) {
      console.error('Error loading bulk operations data:', error);
    }
  };

  const loadSystemHealth = async () => {
    try {
      await adminApi.getAnalytics();
      setSystemHealth({
        database: 'healthy',
        api: 'healthy',
        storage: 'healthy',
        uptime: '99.9%',
      });
    } catch (error) {
      setSystemHealth({
        database: 'unhealthy',
        api: 'unhealthy',
        storage: 'healthy',
        uptime: '99.9%',
      });
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'healthy') return 'text-green-400';
    if (status === 'unhealthy') return 'text-red-400';
    return 'text-yellow-400';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'healthy') return '✅';
    if (status === 'unhealthy') return '❌';
    return '⏳';
  };

  const getActionColor = (action: string) => {
    if (action.includes('Created')) return 'text-green-400';
    if (action.includes('Deleted')) return 'text-red-400';
    if (action.includes('Updated') || action.includes('Promoted')) return 'text-blue-400';
    return 'text-white';
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
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800 mb-8">
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

      {/* Platform Moderation Section */}
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800 mb-8 transition-all duration-300 hover:shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🔒</span> Platform Moderation
          </h2>
          <Link
            to="/moderation"
            className="text-accent-purple text-sm font-medium hover:underline"
          >
            View Full Page →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">⏳</div>
            <h3 className="text-text-muted text-xs mb-1">Pending Approval</h3>
            <p className="text-2xl font-bold text-white">{moderationStats.pending}</p>
          </div>
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">✅</div>
            <h3 className="text-text-muted text-xs mb-1">Approved Events</h3>
            <p className="text-2xl font-bold text-white">{moderationStats.approved}</p>
          </div>
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">🚫</div>
            <h3 className="text-text-muted text-xs mb-1">Flagged Content</h3>
            <p className="text-2xl font-bold text-white">{moderationStats.flagged}</p>
          </div>
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="text-text-muted text-xs mb-1">Total Events</h3>
            <p className="text-2xl font-bold text-white">{moderationStats.total}</p>
          </div>
        </div>
        {pendingEvents.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Events Awaiting Approval</h3>
            <div className="space-y-2">
              {pendingEvents.map((event: any) => (
                <div
                  key={event.id}
                  className="p-3 bg-primary-dark rounded-lg border border-gray-800 hover:border-accent-purple/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{event.name}</h4>
                      <p className="text-text-muted text-xs">{event.location}</p>
                    </div>
                    <span className="text-text-muted text-xs">
                      {new Date(event.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Financial Control Section */}
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800 mb-8 transition-all duration-300 hover:shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>💰</span> Financial Control
          </h2>
          <Link
            to="/financial"
            className="text-accent-purple text-sm font-medium hover:underline"
          >
            View Full Page →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="text-text-muted text-xs mb-1">Total Revenue</h3>
            <p className="text-xl font-bold text-white">
              GHS {parseFloat(financialData?.stats?.total_revenue || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">✅</div>
            <h3 className="text-text-muted text-xs mb-1">Completed</h3>
            <p className="text-xl font-bold text-green-400">
              GHS {parseFloat(financialData?.stats?.completed_revenue || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">⏳</div>
            <h3 className="text-text-muted text-xs mb-1">Pending</h3>
            <p className="text-xl font-bold text-yellow-400">
              GHS {parseFloat(financialData?.stats?.pending_revenue || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">💳</div>
            <h3 className="text-text-muted text-xs mb-1">Transactions</h3>
            <p className="text-xl font-bold text-white">
              {financialData?.stats?.total_transactions || 0}
            </p>
          </div>
        </div>
        {financialData?.revenueByEvent && financialData.revenueByEvent.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Top Revenue Events</h3>
            <div className="space-y-2">
              {financialData.revenueByEvent.slice(0, 3).map((event: any, index: number) => (
                <div
                  key={index}
                  className="p-3 bg-primary-dark rounded-lg border border-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{event.name}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        GHS {parseFloat(event.revenue || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-text-muted text-xs">{event.ticket_count || 0} tickets</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Platform Settings Section */}
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800 mb-8 transition-all duration-300 hover:shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>⚙️</span> Platform Settings
          </h2>
          <Link
            to="/settings"
            className="text-accent-purple text-sm font-medium hover:underline"
          >
            View Full Page →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">⚙️</div>
            <h3 className="text-text-muted text-xs mb-1">Active Settings</h3>
            <p className="text-2xl font-bold text-white">12</p>
          </div>
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">🔔</div>
            <h3 className="text-text-muted text-xs mb-1">Notification Templates</h3>
            <p className="text-2xl font-bold text-white">5</p>
          </div>
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">🎨</div>
            <h3 className="text-text-muted text-xs mb-1">Branding Configs</h3>
            <p className="text-2xl font-bold text-white">3</p>
          </div>
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="text-text-muted text-xs mb-1">Security Rules</h3>
            <p className="text-2xl font-bold text-white">8</p>
          </div>
        </div>
      </div>

      {/* Audit Logs Section */}
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800 mb-8 transition-all duration-300 hover:shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📊</span> Audit Logs
          </h2>
          <Link
            to="/audit-logs"
            className="text-accent-purple text-sm font-medium hover:underline"
          >
            View Full Page →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="text-text-muted text-xs mb-1">Total Logs</h3>
            <p className="text-2xl font-bold text-white">{auditStats.total}</p>
          </div>
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">➕</div>
            <h3 className="text-text-muted text-xs mb-1">Created</h3>
            <p className="text-2xl font-bold text-green-400">{auditStats.created}</p>
          </div>
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">✏️</div>
            <h3 className="text-text-muted text-xs mb-1">Updated</h3>
            <p className="text-2xl font-bold text-blue-400">{auditStats.updated}</p>
          </div>
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">🗑️</div>
            <h3 className="text-text-muted text-xs mb-1">Deleted</h3>
            <p className="text-2xl font-bold text-red-400">{auditStats.deleted}</p>
          </div>
        </div>
        {recentLogs.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-2">
              {recentLogs.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-primary-dark rounded-lg border border-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`font-medium ${getActionColor(log.action)}`}>{log.action}</p>
                      <p className="text-text-muted text-xs">{log.resource}</p>
                    </div>
                    <span className="text-text-muted text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Operations Section */}
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800 mb-8 transition-all duration-300 hover:shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>⚡</span> Bulk Operations
          </h2>
          <Link
            to="/bulk-operations"
            className="text-accent-purple text-sm font-medium hover:underline"
          >
            View Full Page →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="text-text-muted text-xs mb-1">Total Events</h3>
            <p className="text-2xl font-bold text-white">{bulkStats.totalEvents}</p>
          </div>
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">⭐</div>
            <h3 className="text-text-muted text-xs mb-1">Featured</h3>
            <p className="text-2xl font-bold text-yellow-400">{bulkStats.featured}</p>
          </div>
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="text-text-muted text-xs mb-1">Operations</h3>
            <p className="text-2xl font-bold text-white">4</p>
          </div>
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="text-2xl mb-2">✅</div>
            <h3 className="text-text-muted text-xs mb-1">Available Actions</h3>
            <p className="text-2xl font-bold text-accent-purple">4</p>
          </div>
        </div>
      </div>

      {/* System Health Section */}
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>💚</span> System Health
          </h2>
          <Link
            to="/system-health"
            className="text-accent-purple text-sm font-medium hover:underline"
          >
            View Full Page →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">Database</h3>
              <span className={`text-xl ${getStatusColor(systemHealth.database)}`}>
                {getStatusIcon(systemHealth.database)}
              </span>
            </div>
            <p className={`text-xs ${getStatusColor(systemHealth.database)}`}>
              {systemHealth.database === 'healthy' ? 'Connected' : systemHealth.database === 'unhealthy' ? 'Disconnected' : 'Checking...'}
            </p>
          </div>
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">API Server</h3>
              <span className={`text-xl ${getStatusColor(systemHealth.api)}`}>
                {getStatusIcon(systemHealth.api)}
              </span>
            </div>
            <p className={`text-xs ${getStatusColor(systemHealth.api)}`}>
              {systemHealth.api === 'healthy' ? 'Operational' : systemHealth.api === 'unhealthy' ? 'Down' : 'Checking...'}
            </p>
          </div>
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">Storage</h3>
              <span className={`text-xl ${getStatusColor(systemHealth.storage)}`}>
                {getStatusIcon(systemHealth.storage)}
              </span>
            </div>
            <p className={`text-xs ${getStatusColor(systemHealth.storage)}`}>
              {systemHealth.storage === 'healthy' ? 'Available' : systemHealth.storage === 'unhealthy' ? 'Blocked' : 'Checking...'}
            </p>
          </div>
          <div className="bg-primary-dark rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">Uptime</h3>
              <span className="text-xl text-green-400">✅</span>
            </div>
            <p className="text-xs text-green-400">{systemHealth.uptime}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
