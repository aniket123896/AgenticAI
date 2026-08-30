import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';
import { formatDate, formatDateOnly, truncate } from '../../utils/formatters';
import { ArrowUpDown, ChevronRight, Eye } from 'lucide-react';

const ComplaintTable = ({
  complaints = [],
  basePath = '/student/complaints',
  showStudent = false,
  showDepartment = false,
  onSort,
  sortBy,
  sortOrder
}) => {
  const renderSortableHeader = (label, field) => {
    return (
      <th
        scope="col"
        className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-100/80 select-none transition dark:text-slate-200 dark:hover:bg-slate-800/80"
        onClick={() => onSort && onSort(field)}
      >
        <div className="flex items-center gap-1.5">
          <span>{label}</span>
          {onSort && <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />}
        </div>
      </th>
    );
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700">
      <table className="min-w-full divide-y divide-slate-200 text-left text-xs dark:divide-slate-700">
        <thead className="bg-slate-50/80 uppercase tracking-wider font-semibold text-slate-500 dark:bg-slate-800/80 dark:text-slate-300">
          <tr>
            {renderSortableHeader('ID', 'complaintId')}
            {showStudent && <th scope="col" className="px-4 py-3.5 text-left dark:text-slate-200">Student</th>}
            {renderSortableHeader('Title & Category', 'title')}
            {showDepartment && <th scope="col" className="px-4 py-3.5 text-left dark:text-slate-200">Department</th>}
            {renderSortableHeader('Priority', 'priority')}
            {renderSortableHeader('Status', 'status')}
            {renderSortableHeader('Date', 'createdAt')}
            <th scope="col" className="px-4 py-3.5 text-right font-bold text-slate-700 dark:text-slate-200">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-600 dark:divide-slate-700 dark:text-slate-300">
          {complaints.map((complaint) => (
            <tr key={complaint._id} className="hover:bg-indigo-50/30 transition-colors dark:hover:bg-slate-800/80">
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="font-mono font-bold text-indigo-600 bg-indigo-50/80 px-2 py-1 rounded-md border border-indigo-100/60 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-700/60">
                  {complaint.complaintId}
                </span>
              </td>

              {showStudent && (
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="font-semibold text-slate-800 dark:text-slate-100">{complaint.submittedBy?.name || 'Student'}</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-400">{complaint.submittedBy?.studentId || complaint.submittedBy?.department}</div>
                </td>
              )}

              <td className="px-4 py-4">
                <div className="font-bold text-slate-900 line-clamp-1 max-w-xs dark:text-slate-100">{complaint.title}</div>
                <div className="text-[11px] text-slate-500 font-medium dark:text-slate-300">{complaint.category} • {truncate(complaint.location, 25)}</div>
              </td>

              {showDepartment && (
                <td className="px-4 py-4 whitespace-nowrap">
                  {complaint.assignedDepartment ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {complaint.assignedDepartment.name}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-[11px] dark:text-slate-400">Unassigned</span>
                  )}
                </td>
              )}

              <td className="px-4 py-4 whitespace-nowrap">
                <PriorityBadge priority={complaint.priority} size="sm" />
              </td>

              <td className="px-4 py-4 whitespace-nowrap">
                <StatusBadge status={complaint.status} size="sm" />
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-slate-500 dark:text-slate-300">
                {formatDateOnly(complaint.createdAt)}
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-right">
                <Link
                  to={`${basePath}/${complaint._id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-indigo-600 border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComplaintTable;
