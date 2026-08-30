import React from 'react';
import { STATUSES, STATUS_CONFIG } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

const ComplaintTimeline = ({ complaint, history = [] }) => {
  const currentStatusIndex = STATUSES.indexOf(complaint.status);

  // Find date for each status transition from history if available
  const getStatusTimestamp = (statusName) => {
    if (statusName === 'Submitted') {
      return complaint.createdAt;
    }
    if (statusName === 'Resolved' && complaint.resolvedAt) {
      return complaint.resolvedAt;
    }
    if (statusName === 'Closed' && complaint.closedAt) {
      return complaint.closedAt;
    }

    const match = history.find(
      (h) => h.action === 'Status Changed' && h.newValue === statusName
    );
    return match ? match.createdAt : null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
        <Clock className="w-4 h-4 text-indigo-600" />
        Complaint Lifecycle Timeline
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {STATUSES.map((statusName, idx) => {
          const isPassed = idx < currentStatusIndex;
          const isCurrent = idx === currentStatusIndex;
          const isPending = idx > currentStatusIndex;
          const timestamp = getStatusTimestamp(statusName);
          const config = STATUS_CONFIG[statusName];

          return (
            <div key={statusName} className="relative flex items-start group">
              {/* Icon Marker */}
              <div
                className={`absolute -left-[30px] flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-white transition-transform ${
                  isPassed
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-300 ring-indigo-50 animate-pulse-subtle'
                    : 'bg-slate-100 text-slate-300 border border-slate-200'
                }`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                ) : (
                  <Circle className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Status Details */}
              <div className="ml-4 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span
                    className={`text-sm font-bold ${
                      isCurrent
                        ? 'text-indigo-600'
                        : isPassed
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {statusName}
                  </span>

                  {isCurrent && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Current Stage
                    </span>
                  )}
                </div>

                {timestamp && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {formatDate(timestamp)}
                  </p>
                )}

                {/* Additional contextual notes for specific stages */}
                {isCurrent && statusName === 'In Progress' && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-2">
                    Staff is actively working on resolving the issue reported in this complaint.
                  </p>
                )}

                {statusName === 'Resolved' && complaint.resolutionDetails?.text && (
                  <div className="mt-2 text-xs bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl">
                    <p className="font-bold text-emerald-800 mb-1">Resolution Summary:</p>
                    <p className="leading-relaxed">{complaint.resolutionDetails.text}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComplaintTimeline;
