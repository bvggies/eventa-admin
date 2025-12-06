import React, { useState, useEffect } from 'react';
import { eventsApi, adminApi } from '../services/api';

export const PlatformModerationPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await eventsApi.getAll();
      setEvents(response.data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId: string) => {
    try {
      await eventsApi.update(eventId, { is_featured: true });
      loadEvents();
    } catch (error) {
      console.error('Error approving event:', error);
    }
  };

  const handleReject = async (eventId: string) => {
    try {
      await eventsApi.delete(eventId);
      loadEvents();
    } catch (error) {
      console.error('Error rejecting event:', error);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="text-white text-center py-12">Loading moderation queue...</div>
      </div>
    );
  }

  const pendingEvents = events.filter((e: any) => !e.is_featured);

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Platform Moderation</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="text-3xl mb-2">⏳</div>
          <h3 className="text-text-muted text-sm mb-1">Pending Approval</h3>
          <p className="text-3xl font-bold text-white">{pendingEvents.length}</p>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="text-3xl mb-2">✅</div>
          <h3 className="text-text-muted text-sm mb-1">Approved Events</h3>
          <p className="text-3xl font-bold text-white">{events.length - pendingEvents.length}</p>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="text-3xl mb-2">🚫</div>
          <h3 className="text-text-muted text-sm mb-1">Flagged Content</h3>
          <p className="text-3xl font-bold text-white">0</p>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="text-text-muted text-sm mb-1">Total Events</h3>
          <p className="text-3xl font-bold text-white">{events.length}</p>
        </div>
      </div>

      {/* Events Awaiting Approval Section */}
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl mb-8">
        <h2 className="text-xl font-bold text-white mb-6">Events Awaiting Approval</h2>
        {pendingEvents.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p className="text-lg mb-2">No events pending approval</p>
            <p className="text-sm">All events have been reviewed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingEvents.map((event: any) => (
              <div
                key={event.id}
                className="p-4 bg-primary-dark rounded-lg border border-gray-800 hover:border-accent-purple/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-2">{event.name}</h3>
                    <p className="text-text-muted text-sm mb-2">{event.location}</p>
                    <p className="text-text-muted text-xs">
                      Created: {new Date(event.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(event.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(event.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content Moderation Section */}
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl mb-8">
        <h2 className="text-xl font-bold text-white mb-6">Content Moderation</h2>
        <div className="text-center py-12 text-text-muted">
          <p className="text-lg mb-2">No flagged content</p>
          <p className="text-sm">All content is clean and approved</p>
        </div>
      </div>

      {/* User Reports Section */}
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">User Reports</h2>
        <div className="text-center py-12 text-text-muted">
          <p className="text-lg mb-2">No pending reports</p>
          <p className="text-sm">All reports have been reviewed</p>
        </div>
      </div>
    </div>
  );
};

