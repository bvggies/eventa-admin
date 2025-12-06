import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../services/api';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalViews: 0,
    totalRSVPs: 0,
    totalTickets: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await eventsApi.getAll();
      const events = response.data;
      setStats({
        totalEvents: events.length,
        totalViews: events.reduce((sum: number, e: any) => sum + (e.views || 0), 0),
        totalRSVPs: events.reduce((sum: number, e: any) => sum + (e.rsvps || 0), 0),
        totalTickets: 0, // Would need separate endpoint
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statCards = [
    { label: 'Total Events', value: stats.totalEvents, icon: '🎉', color: 'accent-purple' },
    { label: 'Total Views', value: stats.totalViews, icon: '👁️', color: 'accent-teal' },
    { label: 'Total RSVPs', value: stats.totalRSVPs, icon: '✋', color: 'accent-gold' },
    { label: 'Tickets Sold', value: stats.totalTickets, icon: '🎫', color: 'success' },
  ];

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <Link
          to="/events/create"
          className="bg-gradient-to-r from-accent-purple to-accent-teal text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          + Create Event
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-primary-card rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{stat.icon}</span>
              <div className={`w-12 h-12 rounded-lg bg-${stat.color}/20 flex items-center justify-center`}>
                <span className={`text-${stat.color} text-xl`}>📊</span>
              </div>
            </div>
            <h3 className="text-text-muted text-sm mb-1">{stat.label}</h3>
            <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/events/create"
            className="p-4 bg-primary-dark rounded-lg border border-gray-700 hover:border-accent-purple transition-colors"
          >
            <div className="text-2xl mb-2">➕</div>
            <div className="text-white font-semibold">Create Event</div>
            <div className="text-text-muted text-sm">Add a new event</div>
          </Link>
          <Link
            to="/events"
            className="p-4 bg-primary-dark rounded-lg border border-gray-700 hover:border-accent-purple transition-colors"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="text-white font-semibold">Manage Events</div>
            <div className="text-text-muted text-sm">View all events</div>
          </Link>
          <Link
            to="/analytics"
            className="p-4 bg-primary-dark rounded-lg border border-gray-700 hover:border-accent-purple transition-colors"
          >
            <div className="text-2xl mb-2">📈</div>
            <div className="text-white font-semibold">View Analytics</div>
            <div className="text-text-muted text-sm">See insights</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

