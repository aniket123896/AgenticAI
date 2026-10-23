import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const textColor = isDark ? '#f1f5f9' : '#0f172a';
  const labelColor = isDark ? '#cbd5e1' : '#475569';

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
        <PieChart margin={{ top: 10, right: 15, bottom: 10, left: 15 }}>
          <Pie
            data={data}
            cx="50%"
            cy="44%"
            innerRadius={48}
            outerRadius={70}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            label={({ percent }) => (percent > 0.04 ? `${(percent * 100).toFixed(0)}%` : '')}
            labelLine={{ stroke: labelColor, strokeWidth: 1.5 }}
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
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              borderRadius: '12px',
              color: textColor,
              fontSize: '12px',
              boxShadow: '0 8px 22px rgba(15, 23, 42, 0.16)'
            }}
            itemStyle={{ color: textColor }}
            labelStyle={{ color: textColor, fontWeight: 700 }}
          />
          <Legend
            verticalAlign="bottom"
            height={44}
            iconType="circle"
            wrapperStyle={{
              color: labelColor,
              fontSize: '11px',
              fontWeight: 600,
              paddingTop: '8px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusChart;
