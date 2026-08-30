import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CategoryChart = ({ data = [] }) => {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const axisColor = isDark ? '#e2e8f0' : '#334155';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tooltipBg = isDark ? '#020817' : '#1e293b';
  const tooltipText = isDark ? '#e2e8f0' : '#ffffff';

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-slate-500 dark:text-slate-400">
        No category data available yet
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: axisColor, fontWeight: 600 }}
            interval={0}
            angle={-25}
            textAnchor="end"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: axisColor, fontWeight: 600 }}
          />
          <Tooltip
            formatter={(value) => [`${value} complaints`, 'Total']}
            contentStyle={{
              backgroundColor: tooltipBg,
              border: 'none',
              borderRadius: '12px',
              color: tooltipText,
              fontSize: '12px'
            }}
          />
          <Bar
            dataKey="value"
            fill="#6366f1"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;
