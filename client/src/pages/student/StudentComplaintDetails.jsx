import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { useToast } from '../../hooks/useToast';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import ComplaintComments from '../../components/complaints/ComplaintComments';
import AttachmentViewer from '../../components/complaints/AttachmentViewer';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FeedbackModal from '../../components/complaints/FeedbackModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  UserCheck,
  CheckCircle2,
  Star,
  ShieldCheck,
  History,
  AlertCircle
} from 'lucide-react';

const StudentComplaintDetails = () => {
  const { id } = useParams();
  const { success, error } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      const res = await complaintService.getComplaintById(id);
      setData(res.data);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to fetch complaint details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading complaint details..." />;
  }

  if (!data?.complaint) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Complaint Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">The complaint you requested does not exist or you do not have permission.</p>
        <Link to="/student/complaints" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Return to My Complaints
        </Link>
      </div>
    );
  }

  const { complaint, history = [], comments = [] } = data;

  const handleCloseComplaint = async () => {
    setActionLoading(true);
    try {
      await complaintService.closeComplaint(complaint._id);
      success('Complaint successfully marked as Closed. Thank you!');
      setCloseConfirmOpen(false);
      await fetchDetails();
      // Prompt feedback modal automatically
      if (!complaint.feedback) {
        setFeedbackModalOpen(true);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to close complaint');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    setActionLoading(true);
    try {
      await complaintService.submitFeedback(complaint._id, feedbackData);
      success('Thank you! Your feedback and rating have been recorded.');
      setFeedbackModalOpen(false);
      await fetchDetails();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCommentAdded = (newComment) => {
    setData((prev) => ({
      ...prev,
      comments: [...prev.comments, newComment]
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/student/complaints"
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                {complaint.complaintId}
              </span>
              <StatusBadge status={complaint.status} size="sm" />
              <PriorityBadge priority={complaint.priority} size="sm" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {complaint.title}
            </h1>
          </div>
        </div>

        {/* Action button if Resolved */}
        {complaint.status === 'Resolved' && (
          <button
            onClick={() => setCloseConfirmOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl transition shadow-lg shadow-emerald-200 animate-bounce-subtle"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark as Closed
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint Details & Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Problem Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            {/* Meta tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 font-medium">Category: </span>
                  <span className="font-bold text-slate-800">{complaint.category}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-700 font-medium">{complaint.location}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-700">Filed on {formatDate(complaint.createdAt)}</span>
                </div>
                {complaint.assignedDepartment && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="font-bold text-slate-800">
                      {complaint.assignedDepartment.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Staff Allocation details if present */}
            {complaint.assignedStaff && (
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{complaint.assignedStaff.name}</p>
                    <p className="text-purple-700 text-[11px]">
                      {complaint.assignedStaff.designation} • {complaint.assignedStaff.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resolution Card if resolved or closed */}
          {complaint.resolutionDetails?.text && (
            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Official Administrative Resolution
                </div>
                {complaint.resolvedAt && (
                  <span className="text-[11px] text-emerald-700">
                    {formatDate(complaint.resolvedAt)}
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed bg-white/80 p-4 rounded-xl border border-emerald-100 whitespace-pre-wrap">
                {complaint.resolutionDetails.text}
              </p>

              {/* Feedback CTA if closed/resolved and no feedback yet */}
              {!complaint.feedback ? (
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-emerald-800 font-medium">
                    Have you verified the fix? Let us know how we did.
                  </span>
                  <button
                    onClick={() => setFeedbackModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                  >
                    <Star className="w-3.5 h-3.5" />
                    Rate Resolution
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-white/90 border border-emerald-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Your Rating:</span>
                    <div className="flex text-amber-400">
                      {Array.from({ length: complaint.feedback.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  {complaint.feedback.comment && (
                    <span className="text-slate-500 italic truncate max-w-xs">
                      "{complaint.feedback.comment}"
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Attachments Section */}
          <AttachmentViewer attachments={complaint.attachments} />

          {/* Activity updates / Comments thread */}
          <ComplaintComments
            complaintId={complaint._id}
            comments={comments}
            onCommentAdded={handleCommentAdded}
          />
        </div>

        {/* Right Column: Timeline & History Audit */}
        <div className="space-y-6">
          <ComplaintTimeline complaint={complaint} history={history} />

          {/* Audit History Log */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              Audit Log History
            </h3>
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h._id} className="text-xs border-l-2 border-slate-200 pl-3 py-1 space-y-0.5">
                  <p className="font-bold text-slate-800">{h.action}</p>
                  <p className="text-slate-500 text-[11px]">
                    By {h.performedBy?.name || 'System'} ({h.performedBy?.role || 'user'})
                  </p>
                  <p className="text-[10px] text-slate-400">{formatDate(h.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Mark as Closed */}
      <ConfirmDialog
        isOpen={closeConfirmOpen}
        onClose={() => setCloseConfirmOpen(false)}
        onConfirm={handleCloseComplaint}
        title="Close this complaint?"
        message="Please confirm that the reported issue has been satisfactorily resolved. Once marked as closed, you will be invited to leave a satisfaction rating."
        confirmText="Yes, Mark as Closed"
        isLoading={actionLoading}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSubmitFeedback={handleFeedbackSubmit}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default StudentComplaintDetails;
