import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const TrendChart = ({ data = [] }) => {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const axisColor = isDark ? '#e2e8f0' : '#334155';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tooltipBg = isDark ? '#020817' : '#1e293b';
  const tooltipText = isDark ? '#e2e8f0' : '#ffffff';

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-slate-500 dark:text-slate-400">
        No monthly trend data available yet
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: axisColor, fontWeight: 600 }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: axisColor, fontWeight: 600 }}
          />
          <Tooltip
            formatter={(value) => [`${value} complaints`, 'Submissions']}
            contentStyle={{
              backgroundColor: tooltipBg,
              border: 'none',
              borderRadius: '12px',
              color: tooltipText,
              fontSize: '12px'
            }}
          />
          <Line
            type="monotone"
            dataKey="complaints"
            stroke="#4f46e5"
            strokeWidth={3}
            dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: isDark ? '#0f172a' : '#ffffff' }}
            activeDot={{ r: 6, fill: '#6366f1' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
