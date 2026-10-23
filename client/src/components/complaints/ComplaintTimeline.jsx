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
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-colors">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
        <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        Complaint Lifecycle Timeline
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
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
                className={`absolute -left-[30px] flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-white dark:ring-slate-900 transition-transform ${
                  isPassed
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-300 ring-indigo-50 dark:ring-indigo-950/50 animate-pulse-subtle'
                    : 'bg-slate-100 text-slate-300 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-600'
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
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : isPassed
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {statusName}
                  </span>

                  {isCurrent && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-200 dark:border-indigo-800/60">
                      Current Stage
                    </span>
                  )}
                </div>

                {timestamp && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {formatDate(timestamp)}
                  </p>
                )}

                {/* Additional contextual notes for specific stages */}
                {isCurrent && statusName === 'In Progress' && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-2 dark:bg-amber-950/30 dark:border-amber-800/50 dark:text-amber-300">
                    Staff is actively working on resolving the issue reported in this complaint.
                  </p>
                )}

                {isCurrent && statusName === 'Pending Confirmation' && (
                  <p className="text-xs text-violet-700 bg-violet-50 border border-violet-200 rounded-lg p-2.5 mt-2 dark:bg-violet-950/30 dark:border-violet-800/50 dark:text-violet-300 font-medium">
                    Admin proposed resolution. Awaiting student verification: confirm closure or reopen with remarks.
                  </p>
                )}

                {statusName === 'Resolved' && complaint.resolutionDetails?.text && (
                  <div className="mt-2 text-xs bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl dark:bg-emerald-950/30 dark:border-emerald-800/50 dark:text-emerald-300">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300 mb-1">Resolution Summary:</p>
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
