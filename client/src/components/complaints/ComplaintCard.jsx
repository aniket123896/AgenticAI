import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';
import { formatDate, truncate } from '../../utils/formatters';
import { MapPin, Calendar, ArrowRight, Paperclip, MessageSquare } from 'lucide-react';

const ComplaintCard = ({ complaint, basePath = '/student/complaints' }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        {/* Top bar: ID and Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100/80">
            {complaint.complaintId}
          </span>
          <div className="flex items-center gap-1.5">
            <PriorityBadge priority={complaint.priority} size="sm" />
            <StatusBadge status={complaint.status} size="sm" />
          </div>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-1">
          {complaint.title}
        </h4>

        {/* Description */}
        <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
          {complaint.description}
        </p>

        {/* Meta details */}
        <div className="space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">{complaint.category}</span>
            <span>•</span>
            <span className="flex items-center gap-1 truncate text-slate-500">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              {complaint.location}
            </span>
          </div>

          {complaint.assignedDepartment && (
            <div className="text-[11px] text-slate-500 font-medium">
              Assigned: <span className="text-slate-800 font-semibold">{complaint.assignedDepartment.name || 'Department Assigned'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50/75 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formatDate(complaint.createdAt)}
          </span>
          {complaint.attachments?.length > 0 && (
            <span className="flex items-center gap-1 text-slate-500">
              <Paperclip className="w-3 h-3 text-slate-400" />
              {complaint.attachments.length}
            </span>
          )}
        </div>

        <Link
          to={`${basePath}/${complaint._id}`}
          className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 transition"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default ComplaintCard;
