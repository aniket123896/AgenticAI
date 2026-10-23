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
import Modal from '../../components/common/Modal';
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
  AlertCircle,
  RotateCcw,
  HelpCircle,
  Clock,
  Send
} from 'lucide-react';

const StudentComplaintDetails = () => {
  const { id } = useParams();
  const { success, error } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenRemarks, setReopenRemarks] = useState('');
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
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Complaint Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">The complaint you requested does not exist or you do not have permission.</p>
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

  const handleConfirmResolution = async () => {
    setActionLoading(true);
    try {
      await complaintService.confirmResolution(complaint._id);
      success('Resolution confirmed! Thank you for verifying.');
      await fetchDetails();
      if (!complaint.feedback) {
        setFeedbackModalOpen(true);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to confirm resolution');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopenSubmit = async (e) => {
    e.preventDefault();
    if (!reopenRemarks.trim()) {
      error('Please describe what is still broken');
      return;
    }
    setActionLoading(true);
    try {
      await complaintService.reopenComplaint(complaint._id, reopenRemarks.trim());
      success('Complaint reopened and moved back to In Progress. Technicians notified.');
      setReopenModalOpen(false);
      setReopenRemarks('');
      await fetchDetails();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to reopen complaint');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/student/complaints"
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-800/60">
                {complaint.complaintId}
              </span>
              <StatusBadge status={complaint.status} size="sm" />
              <PriorityBadge priority={complaint.priority} size="sm" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
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

      {/* Two-Way Closure (Student Verification Loop) Banner */}
      {(complaint.status === 'Pending Confirmation' || complaint.status === 'Resolved') && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border-2 border-amber-400/50 dark:border-amber-500/40 shadow-lg space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Verification Required
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Auto-closes after 3 days if unconfirmed
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1.5">
                The admin marked this issue resolved. Did this fix the problem?
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Please verify if the hardware or facility is actually working properly before closing this ticket.
              </p>

              {complaint.resolutionDetails?.text && (
                <div className="mt-3 p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/60 dark:border-amber-800/40 text-xs">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Admin's Resolution Note:
                  </p>
                  <p className="text-slate-800 dark:text-slate-200 mt-1 whitespace-pre-wrap font-medium">
                    {complaint.resolutionDetails.text}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button
                  onClick={handleConfirmResolution}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Close
                </button>
                <button
                  onClick={() => setReopenModalOpen(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-rose-500/20 disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reopen with Remarks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Previous Reopen Remarks if issue was reopened */}
      {complaint.reopenRemarks && (
        <div className="p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs space-y-1">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold">
            <RotateCcw className="w-4 h-4" />
            Previous Reopen Remarks {complaint.reopenedAt ? `(${formatDate(complaint.reopenedAt)})` : ''}
          </div>
          <p className="text-rose-950 dark:text-rose-200 whitespace-pre-wrap">
            {complaint.reopenRemarks}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint Details & Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 dark:bg-slate-900 dark:border-slate-800 transition-colors">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Problem Description
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            {/* Meta tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Category: </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{complaint.category}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{complaint.location}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Filed on {formatDate(complaint.createdAt)}</span>
                </div>
                {complaint.assignedDepartment && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {complaint.assignedDepartment.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Staff Allocation details if present */}
            {complaint.assignedStaff && (
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 dark:bg-purple-950/30 dark:border-purple-800/60 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{complaint.assignedStaff.name}</p>
                    <p className="text-purple-700 dark:text-purple-300 text-[11px]">
                      {complaint.assignedStaff.designation} • {complaint.assignedStaff.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resolution Card if resolved or closed */}
          {(complaint.resolutionDetails?.text || ['Pending Confirmation', 'Resolved', 'Closed'].includes(complaint.status)) && (
            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm space-y-3 dark:bg-emerald-950/30 dark:border-emerald-800/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Official Administrative Resolution
                </div>
                {complaint.resolvedAt && (
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    {formatDate(complaint.resolvedAt)}
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed bg-white/80 dark:bg-slate-900/80 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 whitespace-pre-wrap">
                {complaint.resolutionDetails?.text || 'Work has been marked completed by the administrative department. Please verify and confirm resolution.'}
              </p>

              {/* Feedback CTA if closed/resolved and no feedback yet */}
              {!complaint.feedback ? (
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
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
                <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-800 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Your Rating:</span>
                    <div className="flex text-amber-400">
                      {Array.from({ length: complaint.feedback.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  {complaint.feedback.comment && (
                    <span className="text-slate-500 dark:text-slate-400 italic truncate max-w-xs">
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
        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <ComplaintTimeline complaint={complaint} history={history} />

          {/* Audit History Log */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-colors">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Audit Log History
            </h3>
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h._id} className="text-xs border-l-2 border-slate-200 dark:border-slate-700 pl-3 py-1 space-y-0.5">
                  <p className="font-bold text-slate-800 dark:text-slate-100">{h.action}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    By {h.performedBy?.name || 'System'} ({h.performedBy?.role || 'user'})
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{formatDate(h.createdAt)}</p>
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

      {/* Reopen Ticket Modal */}
      <Modal
        isOpen={reopenModalOpen}
        onClose={() => setReopenModalOpen(false)}
        title="Reopen Ticket with Remarks"
      >
        <form onSubmit={handleReopenSubmit} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Tell the administrative team what is still not working so technicians can properly address and fix it.
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              What still needs fixing? <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={reopenRemarks}
              onChange={(e) => setReopenRemarks(e.target.value)}
              placeholder="e.g. The projector turns on but displays 'No Signal', or the fan still makes loud grinding noise..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              required
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setReopenModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading || !reopenRemarks.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-rose-500/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {actionLoading ? 'Reopening...' : 'Reopen Ticket'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentComplaintDetails;
