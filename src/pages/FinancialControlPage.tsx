import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type TimeRange = 'today' | '7days' | '30days' | 'alltime';

export const FinancialControlPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('alltime');
  const [financialData, setFinancialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancialData();
  }, [timeRange]);

  const loadFinancialData = async () => {
    try {
      const response = await adminApi.getFinancialData({ timeRange });
      setFinancialData(response.data);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="text-white text-center py-12">Loading financial data...</div>
      </div>
    );
  }

  const timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: '7days', label: '7 Days' },
    { value: '30days', label: '30 Days' },
    { value: 'alltime', label: 'All Time' },
  ];

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Financial Control</h1>
        <div className="flex gap-2">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value as TimeRange)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === option.value
                  ? 'bg-accent-purple text-white'
                  : 'bg-primary-card text-text-muted hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <div className="text-text-muted text-sm mb-2">Total Revenue</div>
          <div className="text-3xl font-bold text-white">
            GHS {parseFloat(financialData?.stats?.total_revenue || 0).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <div className="text-text-muted text-sm mb-2">Completed Revenue</div>
          <div className="text-3xl font-bold text-green-400">
            GHS {parseFloat(financialData?.stats?.completed_revenue || 0).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <div className="text-text-muted text-sm mb-2">Pending Revenue</div>
          <div className="text-3xl font-bold text-yellow-400">
            GHS {parseFloat(financialData?.stats?.pending_revenue || 0).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
          <div className="text-text-muted text-sm mb-2">Total Transactions</div>
          <div className="text-3xl font-bold text-white">
            {financialData?.stats?.total_transactions || 0}
          </div>
        </div>
      </div>

      {/* Revenue Over Time */}
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Revenue Over Time</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={financialData?.revenueOverTime || []}>
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
            <Line type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue by Event */}
      <div className="bg-primary-card rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">Revenue by Event</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-text-muted">Event</th>
                <th className="text-left py-3 px-4 text-text-muted">Revenue</th>
                <th className="text-left py-3 px-4 text-text-muted">Tickets</th>
              </tr>
            </thead>
            <tbody>
              {financialData?.revenueByEvent?.map((event: any, index: number) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-primary-dark">
                  <td className="py-3 px-4 text-white font-medium">{event.name}</td>
                  <td className="py-3 px-4 text-white">
                    GHS {parseFloat(event.revenue || 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-3 px-4 text-white">{event.ticket_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

