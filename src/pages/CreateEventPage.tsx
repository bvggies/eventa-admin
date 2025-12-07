import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsApi } from '../services/api';

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    latitude: '',
    longitude: '',
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    category: 'Party',
    banner: '',
    ticketPrice: '0',
    isFree: false,
    isFeatured: false,
    isTrending: false,
    promoCode: '',
    promoDiscount: '0',
    organizerName: '',
    ticketOptions: [] as Array<{ name: string; price: number }>,
    gallery: [] as string[],
    ticketLink: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventsApi.create({
        ...formData,
        ticketPrice: parseFloat(formData.ticketPrice),
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        endDate: formData.endDate || undefined,
        endTime: formData.endTime || undefined,
        promoDiscount: formData.promoCode ? parseFloat(formData.promoDiscount) : undefined,
        organizerName: formData.organizerName || undefined,
        ticketOptions: formData.ticketOptions.length > 0 ? formData.ticketOptions : undefined,
        gallery: formData.gallery.length > 0 ? formData.gallery : undefined,
        ticketLink: formData.ticketLink || undefined,
      });
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    }
  };

  const addTicketOption = () => {
    setFormData({
      ...formData,
      ticketOptions: [...formData.ticketOptions, { name: '', price: 0 }],
    });
  };

  const updateTicketOption = (index: number, field: 'name' | 'price', value: string | number) => {
    const updated = [...formData.ticketOptions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, ticketOptions: updated });
  };

  const removeTicketOption = (index: number) => {
    setFormData({
      ...formData,
      ticketOptions: formData.ticketOptions.filter((_, i) => i !== index),
    });
  };

  const addGalleryImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setFormData({
        ...formData,
        gallery: [...formData.gallery, url],
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData({
      ...formData,
      gallery: formData.gallery.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Create Event</h1>
      <form onSubmit={handleSubmit} className="bg-primary-card rounded-xl p-6 border border-gray-800 space-y-6">
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

        <div>
          <label className="block text-sm font-medium text-white mb-2">Organizer Name (Optional - defaults to your name)</label>
          <input
            type="text"
            value={formData.organizerName}
            onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
            className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white"
            placeholder="Leave empty to use your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white"
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white"
            >
              <option>Party</option>
              <option>Concert</option>
              <option>Beach</option>
              <option>Club</option>
              <option>Church</option>
              <option>Conference</option>
              <option>Festival</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Start Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Start Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">End Date (Optional)</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">End Time (Optional)</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white"
              placeholder="Full address"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white"
                placeholder="5.6037"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white"
                placeholder="-0.1870"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Banner URL</label>
          <input
            type="url"
            value={formData.banner}
            onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
            className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white"
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isFree}
              onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
              className="mr-2"
            />
            <span className="text-white">Free Event</span>
          </label>
          {!formData.isFree && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-white mb-2">Default Ticket Price (GHS)</label>
              <input
                type="number"
                value={formData.ticketPrice}
                onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white"
                min="0"
                step="0.01"
              />
            </div>
          )}
        </div>

        {!formData.isFree && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white">Ticket Options (Different Prices)</label>
              <button
                type="button"
                onClick={addTicketOption}
                className="px-3 py-1 bg-accent-purple text-white rounded-lg text-sm hover:opacity-90"
              >
                + Add Option
              </button>
            </div>
            {formData.ticketOptions.map((option, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={option.name}
                  onChange={(e) => updateTicketOption(index, 'name', e.target.value)}
                  placeholder="Ticket type (e.g., VIP, General)"
                  className="flex-1 px-4 py-2 bg-primary-dark border border-gray-700 rounded-lg text-white"
                />
                <input
                  type="number"
                  value={option.price}
                  onChange={(e) => updateTicketOption(index, 'price', parseFloat(e.target.value) || 0)}
                  placeholder="Price"
                  className="w-32 px-4 py-2 bg-primary-dark border border-gray-700 rounded-lg text-white"
                  min="0"
                  step="0.01"
                />
                <button
                  type="button"
                  onClick={() => removeTicketOption(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:opacity-90"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white mb-2">External Ticket Link (Optional)</label>
          <input
            type="url"
            value={formData.ticketLink}
            onChange={(e) => setFormData({ ...formData, ticketLink: e.target.value })}
            className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white"
            placeholder="https://ticketmaster.com/event/..."
          />
          <p className="text-sm text-gray-400 mt-1">Users will be redirected here to purchase tickets</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-white">Gallery Photos</label>
            <button
              type="button"
              onClick={addGalleryImage}
              className="px-3 py-1 bg-accent-purple text-white rounded-lg text-sm hover:opacity-90"
            >
              + Add Image
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {formData.gallery.map((url, index) => (
              <div key={index} className="relative">
                <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:opacity-90"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Promo Code (Optional)</label>
            <input
              type="text"
              value={formData.promoCode}
              onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
              className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white"
              placeholder="SUMMER2024"
            />
          </div>
          {formData.promoCode && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">Discount (%)</label>
              <input
                type="number"
                value={formData.promoDiscount}
                onChange={(e) => setFormData({ ...formData, promoDiscount: e.target.value })}
                className="w-full px-4 py-3 bg-primary-dark border border-gray-700 rounded-lg text-white"
                min="0"
                max="100"
                step="1"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="mr-2"
            />
            <span className="text-white">Featured Event</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isTrending}
              onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
              className="mr-2"
            />
            <span className="text-white">Trending Event</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-gradient-to-r from-accent-purple to-accent-teal text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
};

