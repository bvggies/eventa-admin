import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventsApi } from '../services/api';

export const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const response = await eventsApi.getById(id!);
      const event = response.data;
      setFormData({
        name: event.name,
        description: event.description,
        location: event.location,
        category: event.category,
        date: event.date,
        time: event.time,
        banner: event.banner,
        ticketPrice: event.ticket_price,
        isFree: event.is_free,
      });
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventsApi.update(id!, formData);
      navigate('/events');
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event');
    }
  };

  if (loading || !formData) {
    return <div className="text-white text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Edit Event</h1>
      <form onSubmit={handleSubmit} className="bg-primary-card rounded-xl p-6 border border-gray-800 space-y-6">
        {/* Similar form fields as CreateEventPage */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Event Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white"
            required
          />
        </div>
        {/* Add other fields similarly */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="flex-1 py-3 bg-gray-700 text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-gradient-to-r from-accent-purple to-accent-teal text-white rounded-lg"
          >
            Update Event
          </button>
        </div>
      </form>
    </div>
  );
};

