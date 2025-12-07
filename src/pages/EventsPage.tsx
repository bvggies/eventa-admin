import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi, authApi } from '../services/api';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserAndEvents();
  }, []);

  const loadUserAndEvents = async () => {
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
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventsApi.delete(id);
        loadUserAndEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-white text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Events</h1>
          {!isAdmin && (
            <p className="text-text-muted mt-1">Your events only</p>
          )}
        </div>
        <Link
          to="/events/create"
          className="bg-gradient-to-r from-accent-purple to-accent-teal text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          + Create Event
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-primary-card rounded-xl overflow-hidden border border-gray-800"
          >
            <img
              src={event.banner || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'}
              alt={event.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
              <p className="text-text-muted text-sm mb-4">{event.location}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-text-muted">
                  {new Date(event.date).toLocaleDateString()}
                </span>
                <span className="px-3 py-1 bg-accent-purple/20 text-accent-purple rounded-full text-xs font-semibold">
                  {event.category}
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/events/${event.id}/attendees`}
                  className="flex-1 text-center py-2 bg-accent-teal text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                  Attendees
                </Link>
                <Link
                  to={`/events/${event.id}/edit`}
                  className="flex-1 text-center py-2 bg-accent-purple text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="flex-1 py-2 bg-danger text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

