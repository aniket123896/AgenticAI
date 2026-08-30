import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { CATEGORIES, PRIORITIES, STATUSES } from '../../utils/constants';

const ComplaintFilters = ({
  filters,
  onFilterChange,
  onReset,
  departments = [],
  showDepartmentFilter = false
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 dark:bg-slate-900 dark:border-slate-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search input */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, title, keyword..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-800"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition text-slate-700 font-medium dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:bg-slate-800"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={filters.category || 'all'}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition text-slate-700 font-medium dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:bg-slate-800"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Priority or Department */}
        {showDepartmentFilter ? (
          <div>
            <select
              value={filters.department || 'all'}
              onChange={(e) => onFilterChange('department', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition text-slate-700 font-medium dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:bg-slate-800"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <select
              value={filters.priority || 'all'}
              onChange={(e) => onFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition text-slate-700 font-medium dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:bg-slate-800"
            >
              <option value="all">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Active filters and reset */}
      {(filters.search ||
        (filters.status && filters.status !== 'all') ||
        (filters.category && filters.category !== 'all') ||
        (filters.priority && filters.priority !== 'all') ||
        (filters.department && filters.department !== 'all')) && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs dark:border-slate-700">
          <span className="text-slate-500 dark:text-slate-300">Filters applied</span>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
          >
            <RotateCcw className="w-3 h-3" />
            Reset all
          </button>
        </div>
      )}
    </div>
  );
};

export default ComplaintFilters;
