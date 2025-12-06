import React, { useState, useEffect } from 'react';
import { eventsApi, adminApi } from '../services/api';

export const BulkOperationsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [operation, setOperation] = useState<'feature' | 'unfeature' | 'delete' | 'export' | null>(null);

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

  const handleSelectAll = () => {
    if (selectedEvents.size === events.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(events.map((e: any) => e.id)));
    }
  };

  const handleSelectEvent = (eventId: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const handleBulkOperation = async () => {
    if (!operation || selectedEvents.size === 0) return;

    try {
      const promises = Array.from(selectedEvents).map((id) => {
        if (operation === 'feature') {
          return eventsApi.update(id, { isFeatured: true });
        } else if (operation === 'unfeature') {
          return eventsApi.update(id, { isFeatured: false });
        } else if (operation === 'delete') {
          return eventsApi.delete(id);
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      setSelectedEvents(new Set());
      setOperation(null);
      loadEvents();
      alert(`Successfully ${operation}ed ${selectedEvents.size} event(s)`);
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      alert('Error performing bulk operation');
    }
  };

  const handleExport = () => {
    const selected = events.filter((e: any) => selectedEvents.has(e.id));
    const csv = [
      ['Name', 'Location', 'Date', 'Category', 'Views', 'RSVPs'].join(','),
      ...selected.map((e: any) => [
        e.name,
        e.location,
        e.date,
        e.category,
        e.views || 0,
        e.rsvps || 0,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events-export-${new Date().toISOString()}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="text-white text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-white mb-8">Bulk Operations</h1>

      <div className="bg-primary-card rounded-xl p-6 border border-gray-800 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white font-semibold">
              {selectedEvents.size} event(s) selected
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-primary-dark border border-gray-700 rounded-lg text-white hover:border-accent-purple transition-colors"
            >
              {selectedEvents.size === events.length ? 'Deselect All' : 'Select All'}
            </button>
            {selectedEvents.size > 0 && (
              <>
                <button
                  onClick={() => setOperation('feature')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Feature Selected
                </button>
                <button
                  onClick={() => setOperation('unfeature')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Unfeature Selected
                </button>
                <button
                  onClick={() => setOperation('delete')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Selected
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Export CSV
                </button>
              </>
            )}
          </div>
        </div>

        {operation && (
          <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg">
            <p className="text-yellow-400 mb-2">
              Are you sure you want to {operation} {selectedEvents.size} event(s)?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleBulkOperation}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setOperation(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {events.map((event: any) => (
          <div
            key={event.id}
            className={`p-4 bg-primary-card rounded-lg border transition-all ${
              selectedEvents.has(event.id)
                ? 'border-accent-purple bg-purple-500/10'
                : 'border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedEvents.has(event.id)}
                onChange={() => handleSelectEvent(event.id)}
                className="w-5 h-5 rounded border-gray-700 text-accent-purple focus:ring-accent-purple"
              />
              <div className="flex-1">
                <h3 className="text-white font-semibold">{event.name}</h3>
                <p className="text-text-muted text-sm">{event.location} • {event.date}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">{event.views || 0} views</p>
                <p className="text-text-muted text-sm">{event.rsvps || 0} RSVPs</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

