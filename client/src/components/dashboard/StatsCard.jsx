import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatsCard = ({
  title,
  value,
  icon: Icon,
  color = 'indigo',
  link,
  subtext
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50/80',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
      shadow: 'shadow-indigo-100/50'
    },
    blue: {
      bg: 'bg-blue-50/80',
      text: 'text-blue-600',
      border: 'border-blue-100',
      shadow: 'shadow-blue-100/50'
    },
    purple: {
      bg: 'bg-purple-50/80',
      text: 'text-purple-600',
      border: 'border-purple-100',
      shadow: 'shadow-purple-100/50'
    },
    amber: {
      bg: 'bg-amber-50/80',
      text: 'text-amber-600',
      border: 'border-amber-100',
      shadow: 'shadow-amber-100/50'
    },
    emerald: {
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      shadow: 'shadow-emerald-100/50'
    },
    rose: {
      bg: 'bg-rose-50/80',
      text: 'text-rose-600',
      border: 'border-rose-100',
      shadow: 'shadow-rose-100/50'
    },
    slate: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      shadow: 'shadow-slate-100'
    }
  };

  const scheme = colorMap[color] || colorMap.indigo;

  const content = (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group dark:bg-slate-900 dark:border-slate-700">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</span>
        <div className={`w-10 h-10 rounded-xl ${scheme.bg} ${scheme.text} flex items-center justify-center font-bold shadow-sm group-hover:scale-110 transition transform dark:shadow-none`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white">{value ?? 0}</span>
        {link && (
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition dark:text-slate-500" />
        )}
      </div>

      {subtext && <p className="text-[11px] text-slate-400 font-medium mt-1 dark:text-slate-400">{subtext}</p>}
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }

  return content;
};

export default StatsCard;
