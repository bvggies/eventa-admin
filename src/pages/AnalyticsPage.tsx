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
} from 'recharts';
import { eventsApi } from '../services/api';

const COLORS = ['#7C3AED', '#06B6D4', '#F59E0B', '#10B981', '#EF4444'];

export const AnalyticsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await eventsApi.getAll();
      setEvents(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalViews = events.reduce((sum, e) => sum + (e.views || 0), 0);
  const totalRSVPs = events.reduce((sum, e) => sum + (e.rsvps || 0), 0);
  const totalLikes = events.reduce((sum, e) => sum + (e.likes || 0), 0);
  const totalSaves = events.reduce((sum, e) => sum + (e.saves || 0), 0);

  // Prepare data for charts
  const viewsData = events
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
    .map((e) => ({
      name: e.name.length > 15 ? e.name.substring(0, 15) + '...' : e.name,
      views: e.views || 0,
    }));

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

  const engagementData = events
    .sort((a, b) => {
      const aEng = (a.rsvps || 0) + (a.likes || 0) + (a.saves || 0);
      const bEng = (b.rsvps || 0) + (b.likes || 0) + (b.saves || 0);
      return bEng - aEng;
    })
    .slice(0, 5)
    .map((e) => ({
      name: e.name.length > 15 ? e.name.substring(0, 15) + '...' : e.name,
      RSVPs: e.rsvps || 0,
      Likes: e.likes || 0,
      Saves: e.saves || 0,
    }));

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="text-white text-center py-12">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-white mb-8">Analytics Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <div className="text-text-muted text-sm mb-2">Total Views</div>
          <div className="text-3xl font-bold text-white">{totalViews.toLocaleString()}</div>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <div className="text-text-muted text-sm mb-2">Total RSVPs</div>
          <div className="text-3xl font-bold text-white">{totalRSVPs.toLocaleString()}</div>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <div className="text-text-muted text-sm mb-2">Total Likes</div>
          <div className="text-3xl font-bold text-white">{totalLikes.toLocaleString()}</div>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <div className="text-text-muted text-sm mb-2">Total Saves</div>
          <div className="text-3xl font-bold text-white">{totalSaves.toLocaleString()}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Events by Views */}
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Top Events by Views</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={viewsData}>
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
              <Bar dataKey="views" fill="#7C3AED" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Events by Category */}
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Events by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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

      {/* Engagement Chart */}
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">Top Events by Engagement</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={engagementData}>
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
            <Bar dataKey="RSVPs" fill="#7C3AED" />
            <Bar dataKey="Likes" fill="#06B6D4" />
            <Bar dataKey="Saves" fill="#F59E0B" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
