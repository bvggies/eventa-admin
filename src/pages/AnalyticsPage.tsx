import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { eventsApi, adminApi, authApi } from '../services/api';

const COLORS = ['#7C3AED', '#06B6D4', '#F59E0B', '#10B981', '#EF4444'];

type TabType = 'overview' | 'events' | 'hashtags' | 'posts' | 'users';

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Reset to overview if organizer tries to access admin-only tabs
  useEffect(() => {
    if (!isAdmin && (activeTab === 'hashtags' || activeTab === 'posts' || activeTab === 'users')) {
      setActiveTab('overview');
    }
  }, [isAdmin, activeTab]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get current user to check role and filter events
      const userResponse = await authApi.getCurrentUser();
      const currentUser = userResponse.data;
      setIsAdmin(currentUser.is_admin || false);
      setUserId(currentUser.id);

      // Load events
      const eventsResponse = await eventsApi.getAll();
      let allEvents = eventsResponse.data;
      
      // If user is organizer (not admin), filter to show only their events
      if (!currentUser.is_admin && currentUser.is_organizer) {
        allEvents = allEvents.filter((e: any) => 
          e.organizer_id === currentUser.id || e.organizerId === currentUser.id
        );
      }
      
      setEvents(allEvents);
      
      // Only load admin analytics if user is admin
      if (currentUser.is_admin) {
        try {
          await adminApi.getAnalytics();
        } catch (error) {
          // Silently fail if admin API is not available
        }
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // KPI Calculations
  const totalEvents = events.length;
  const verifiedOrganizers = isAdmin ? new Set(events.map((e: any) => e.organizer_id)).size : 0;
  const totalRevenue = events.reduce((sum: number, e: any) => {
    const ticketPrice = e.ticket_price || 0;
    const ticketsSold = Math.floor((e.rsvps || 0) * 0.5);
    return sum + (ticketPrice * ticketsSold);
  }, 0);
  const totalTickets = events.reduce((sum: number, e: any) => Math.floor((e.rsvps || 0) * 0.5), 0);
  const totalRSVPs = events.reduce((sum: number, e: any) => sum + (e.rsvps || 0), 0);
  const dailyActiveUsers = isAdmin ? Math.floor(totalRSVPs * 0.3) : 0; // Estimate - admin only
  const mostActiveCity = isAdmin ? 'Accra' : ''; // Would come from location data - admin only
  const notificationsSent = isAdmin ? totalRSVPs * 2 : 0; // Estimate - admin only

  // Trending Events
  const trendingEvents = events
    .map((e: any) => ({
      ...e,
      engagement: (e.views || 0) + (e.rsvps || 0) * 2 + (e.likes || 0) + (e.saves || 0),
    }))
    .sort((a: any, b: any) => b.engagement - a.engagement)
    .slice(0, 5);

  // Hashtag Analytics (mock data - would come from buzz API)
  const hashtagData = [
    { name: '#GhanaEvents', posts: 1200, growth: 250, trend: 'up' },
    { name: '#LabadiParty', posts: 300, growth: 96, trend: 'up' },
    { name: '#AccraNight', posts: 190, growth: -12, trend: 'down' },
    { name: '#Afrobeats', posts: 450, growth: 150, trend: 'up' },
  ];

  // Time series data (mock - would come from time-based analytics)
  const timeSeriesData = [
    { date: 'Mon', views: 1200, rsvps: 240, tickets: 120 },
    { date: 'Tue', views: 1900, rsvps: 380, tickets: 190 },
    { date: 'Wed', views: 1500, rsvps: 300, tickets: 150 },
    { date: 'Thu', views: 2100, rsvps: 420, tickets: 210 },
    { date: 'Fri', views: 2800, rsvps: 560, tickets: 280 },
    { date: 'Sat', views: 3200, rsvps: 640, tickets: 320 },
    { date: 'Sun', views: 2900, rsvps: 580, tickets: 290 },
  ];

  // Event performance data
  const eventPerformanceData = events
    .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
    .map((e: any) => ({
      name: (e.name || '').length > 15 ? (e.name || '').substring(0, 15) + '...' : (e.name || 'Unnamed Event'),
      views: e.views || 0,
      rsvps: e.rsvps || 0,
      tickets: Math.floor((e.rsvps || 0) * 0.5),
      conversion: ((e.rsvps || 0) / (e.views || 1)) * 100,
    }));

  // Category distribution
  const categoryData = events.reduce((acc: any, event) => {
    const cat = event.category || 'Other';
    if (!acc[cat]) {
      acc[cat] = 0;
    }
    acc[cat]++;
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }));

  // KPI Cards - Different for admin vs organizer
  const kpiCards = isAdmin ? [
    { label: '🔥 Total Events', value: totalEvents, icon: '🎉', color: 'purple' },
    { label: '🪪 Verified Organizers', value: verifiedOrganizers, icon: '✅', color: 'teal' },
    { label: '💳 Total Revenue', value: `GHS ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: '💰', color: 'green' },
    { label: '🎟 Tickets Sold', value: totalTickets, icon: '🎫', color: 'yellow' },
    { label: '👥 RSVPs', value: totalRSVPs, icon: '✋', color: 'purple' },
    { label: '📈 Daily Active Users', value: dailyActiveUsers, icon: '👤', color: 'teal' },
    { label: '📍 Most Active City', value: mostActiveCity, icon: '🏙️', color: 'blue' },
    { label: '🔔 Notifications Sent', value: notificationsSent, icon: '📱', color: 'pink' },
  ] : [
    // Organizer-only KPIs
    { label: '📅 My Events', value: totalEvents, icon: '🎉', color: 'purple' },
    { label: '💳 Total Revenue', value: `GHS ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: '💰', color: 'green' },
    { label: '🎟 Tickets Sold', value: totalTickets, icon: '🎫', color: 'yellow' },
    { label: '👥 RSVPs', value: totalRSVPs, icon: '✋', color: 'purple' },
    { label: '👁️ Total Views', value: events.reduce((sum: number, e: any) => sum + (e.views || 0), 0), icon: '👀', color: 'teal' },
  ];

  // Tabs - Different for admin vs organizer
  const tabs = isAdmin ? [
    { id: 'overview' as TabType, label: '📈 Overview', icon: '📊' },
    { id: 'events' as TabType, label: '📅 Events', icon: '🎉' },
    { id: 'hashtags' as TabType, label: '🔥 Hashtags', icon: '#' },
    { id: 'posts' as TabType, label: '💬 Posts', icon: '📝' },
    { id: 'users' as TabType, label: '👥 Users', icon: '👤' },
  ] : [
    // Organizer-only tabs
    { id: 'overview' as TabType, label: '📈 Overview', icon: '📊' },
    { id: 'events' as TabType, label: '📅 My Events', icon: '🎉' },
  ];

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="text-white text-center py-12">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
        {!isAdmin && (
          <p className="text-text-muted">Your events analytics</p>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{kpi.icon}</span>
            </div>
            <h3 className="text-text-muted text-sm mb-1">{kpi.label}</h3>
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
              activeTab === tab.id
                ? 'border-accent-purple text-white'
                : 'border-transparent text-text-muted hover:text-white hover:border-gray-600'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Combined Graph */}
          <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">📊 Overall Performance</h2>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={timeSeriesData}>
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
                <Area type="monotone" dataKey="views" stackId="1" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.6} />
                <Area type="monotone" dataKey="rsvps" stackId="2" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.6} />
                <Area type="monotone" dataKey="tickets" stackId="3" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trending Events */}
            <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4">🔥 Trending Events Today</h2>
              <div className="space-y-4">
                {trendingEvents.map((event: any, index: number) => (
                  <div
                    key={event.id}
                    className="p-4 bg-primary-dark rounded-lg border border-gray-800 hover:border-accent-purple/50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-accent-purple">#{index + 1}</span>
                        <div>
                          <p className="text-white font-semibold">{event.name}</p>
                          <p className="text-text-muted text-sm">{event.views || 0} views</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-accent-teal font-bold">{event.rsvps || 0}</p>
                        <p className="text-text-muted text-xs">RSVPs</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Events by Category */}
            <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4">Events by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F1724',
                      border: '1px solid #2A2F36',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Event Performance Chart */}
          <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">📊 Event Performance Metrics</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={eventPerformanceData}>
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
                <Legend />
                <Bar dataKey="views" fill="#7C3AED" name="Views" />
                <Bar dataKey="rsvps" fill="#06B6D4" name="RSVPs" />
                <Bar dataKey="tickets" fill="#10B981" name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Event Table */}
          <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Event Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-text-muted">Event</th>
                    <th className="text-left py-3 px-4 text-text-muted">Views</th>
                    <th className="text-left py-3 px-4 text-text-muted">RSVPs</th>
                    <th className="text-left py-3 px-4 text-text-muted">Tickets</th>
                    <th className="text-left py-3 px-4 text-text-muted">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {eventPerformanceData.map((event, index) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-primary-dark transition-colors">
                      <td className="py-3 px-4 text-white font-medium">{event.name}</td>
                      <td className="py-3 px-4 text-white">{event.views.toLocaleString()}</td>
                      <td className="py-3 px-4 text-white">{event.rsvps.toLocaleString()}</td>
                      <td className="py-3 px-4 text-white">{event.tickets.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className="text-accent-teal">{event.conversion.toFixed(1)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Hashtags Tab - Admin Only */}
      {isAdmin && activeTab === 'hashtags' && (
        <div className="space-y-6">
          <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">🔥 Hashtag Analytics</h2>
            <div className="space-y-4">
              {hashtagData.map((hashtag, index) => (
                <div
                  key={index}
                  className="p-4 bg-primary-dark rounded-lg border border-gray-800 hover:border-accent-purple/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-lg">{hashtag.name}</p>
                      <p className="text-text-muted text-sm">{hashtag.posts.toLocaleString()} posts</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold text-lg ${
                          hashtag.trend === 'up' ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {hashtag.trend === 'up' ? '▲' : '▼'} {Math.abs(hashtag.growth)}%
                      </p>
                      <p className="text-text-muted text-xs">Growth</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Posts Tab - Admin Only */}
      {isAdmin && activeTab === 'posts' && (
        <div className="space-y-6">
          <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">💬 Buzz/Social Posts Analytics</h2>
            <div className="text-center py-12 text-text-muted">
              <p className="text-lg mb-2">📝 Post analytics coming soon</p>
              <p className="text-sm">This will show engagement metrics from the Buzz feed</p>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab - Admin Only */}
      {isAdmin && activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">👥 User Analytics</h2>
            <div className="text-center py-12 text-text-muted">
              <p className="text-lg mb-2">👤 User analytics coming soon</p>
              <p className="text-sm">This will show user growth, demographics, and engagement</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
