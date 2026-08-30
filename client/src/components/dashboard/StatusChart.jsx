import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = {
  Submitted: '#94a3b8',
  'Under Review': '#3b82f6',
  Assigned: '#a855f7',
  'In Progress': '#f59e0b',
  Resolved: '#10b981',
  Closed: '#71717a'
};

const DEFAULT_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const StatusChart = ({ data = [] }) => {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const tooltipBg = isDark ? '#020817' : '#ffffff';
  const textColor = isDark ? '#e2e8f0' : '#0f172a';
  const labelColor = isDark ? '#e2e8f0' : '#334155';

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-slate-500 dark:text-slate-400">
        No status data available yet
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            labelLine={{ stroke: labelColor, strokeWidth: 1 }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                stroke={isDark ? '#0f172a' : '#ffffff'}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(val, name) => [`${val} complaints`, name]}
            labelFormatter={(label) => `${label}`}
            contentStyle={{
              backgroundColor: tooltipBg,
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '12px',
              color: textColor,
              fontSize: '12px',
              boxShadow: '0 8px 22px rgba(15, 23, 42, 0.12)'
            }}
            itemStyle={{ color: textColor }}
            labelStyle={{ color: textColor, fontWeight: 700 }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{
              color: labelColor,
              fontSize: '12px',
              fontWeight: 600
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusChart;
