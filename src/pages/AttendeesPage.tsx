import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsApi } from '../services/api';

export const AttendeesPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [attendees, setAttendees] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (eventId) {
      loadEvent();
      loadAttendees();
    }
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const response = await eventsApi.getById(eventId!);
      setEvent(response.data);
    } catch (error) {
      console.error('Error loading event:', error);
    }
  };

  const loadAttendees = async () => {
    try {
      // In production, this would be a separate endpoint
      // For now, we'll simulate with RSVP data
      const response = await eventsApi.getById(eventId!);
      // Mock attendees data
      setAttendees([
        { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+233 24 123 4567', rsvpStatus: 'going', ticketCount: 2 },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+233 24 234 5678', rsvpStatus: 'interested', ticketCount: 1 },
        { id: '3', name: 'Mike Johnson', email: 'mike@example.com', phone: '+233 24 345 6789', rsvpStatus: 'going', ticketCount: 3 },
      ]);
    } catch (error) {
      console.error('Error loading attendees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendees = attendees.filter((attendee) => {
    const name = (attendee.name || '').toLowerCase();
    const email = (attendee.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'RSVP Status', 'Tickets'];
    const rows = attendees.map((a) => [
      a.name,
      a.email,
      a.phone,
      a.rsvpStatus,
      a.ticketCount,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendees-${event?.name || 'event'}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="text-white text-center py-12">Loading attendees...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link to="/events" className="text-accent-purple hover:underline mb-2 inline-block">
            ← Back to Events
          </Link>
          <h1 className="text-3xl font-bold text-white">
            Attendees - {event?.name || 'Event'}
          </h1>
        </div>
        <button
          onClick={exportCSV}
          className="px-6 py-3 bg-accent-teal text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-primary-card rounded-xl p-6 border border-gray-800 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-text-muted text-sm mb-1">Total Attendees</div>
            <div className="text-2xl font-bold text-white">{attendees.length}</div>
          </div>
          <div>
            <div className="text-text-muted text-sm mb-1">Going</div>
            <div className="text-2xl font-bold text-white">
              {attendees.filter((a) => a.rsvpStatus === 'going').length}
            </div>
          </div>
          <div>
            <div className="text-text-muted text-sm mb-1">Interested</div>
            <div className="text-2xl font-bold text-white">
              {attendees.filter((a) => a.rsvpStatus === 'interested').length}
            </div>
          </div>
          <div>
            <div className="text-text-muted text-sm mb-1">Total Tickets</div>
            <div className="text-2xl font-bold text-white">
              {attendees.reduce((sum, a) => sum + a.ticketCount, 0)}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search attendees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white placeholder-text-muted"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-white font-semibold">Name</th>
                <th className="text-left py-3 px-4 text-white font-semibold">Email</th>
                <th className="text-left py-3 px-4 text-white font-semibold">Phone</th>
                <th className="text-left py-3 px-4 text-white font-semibold">RSVP Status</th>
                <th className="text-left py-3 px-4 text-white font-semibold">Tickets</th>
                <th className="text-left py-3 px-4 text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.map((attendee) => (
                <tr key={attendee.id} className="border-b border-gray-800 hover:bg-primary-dark">
                  <td className="py-3 px-4 text-white">{attendee.name}</td>
                  <td className="py-3 px-4 text-text-muted">{attendee.email}</td>
                  <td className="py-3 px-4 text-text-muted">{attendee.phone}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        attendee.rsvpStatus === 'going'
                          ? 'bg-success text-white'
                          : 'bg-accent-gold text-white'
                      }`}
                    >
                      {attendee.rsvpStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">{attendee.ticketCount}</td>
                  <td className="py-3 px-4">
                    <button className="text-accent-purple hover:underline text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAttendees.length === 0 && (
          <div className="text-center py-12">
            <div className="text-text-muted">No attendees found</div>
          </div>
        )}
      </div>
    </div>
  );
};

