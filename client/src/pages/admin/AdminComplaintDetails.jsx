import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { departmentService } from '../../services/departmentService';
import { staffService } from '../../services/staffService';
import { useToast } from '../../hooks/useToast';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import ComplaintComments from '../../components/complaints/ComplaintComments';
import AttachmentViewer from '../../components/complaints/AttachmentViewer';
import ResolutionModal from '../../components/complaints/ResolutionModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { STATUSES, PRIORITIES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  User,
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  History,
  AlertTriangle,
  Send,
  Star,
  Check
} from 'lucide-react';

const AdminComplaintDetails = () => {
  const { id } = useParams();
  const { success, error, warning } = useToast();

  const [data, setData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');

  // Modals
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchComplaintAndMetadata = async () => {
    try {
      const [compRes, deptsRes, staffRes] = await Promise.all([
        complaintService.getComplaintById(id),
        departmentService.getDepartments(),
        staffService.getStaff()
      ]);

      setData(compRes.data);
      setDepartments(deptsRes.data);
      setStaffList(staffRes.data);

      const c = compRes.data.complaint;
      setSelectedStatus(c.status);
      setSelectedPriority(c.priority);
      setSelectedDept(c.assignedDepartment?._id || '');
      setSelectedStaff(c.assignedStaff?._id || '');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to fetch details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintAndMetadata();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading administrative view..." />;
  }

  if (!data?.complaint) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Complaint Not Found</h2>
        <Link to="/admin/complaints" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Back to Complaint Directory
        </Link>
      </div>
    );
  }

  const { complaint, history = [], comments = [] } = data;

  // Filter staff by currently selected department
  const filteredStaff = staffList.filter((s) => {
    if (!selectedDept) return true;
    const deptId = typeof s.department === 'object' ? s.department._id : s.department;
    return deptId === selectedDept;
  });

  const handleStatusSelectChange = (newStatus) => {
    if (newStatus === 'Resolved') {
      setResolutionModalOpen(true);
      return;
    }

    const statusOrder = STATUSES;
    const currentIndex = statusOrder.indexOf(complaint.status);
    const newIndex = statusOrder.indexOf(newStatus);

    if (newIndex < currentIndex) {
      setPendingStatus(newStatus);
      setStatusConfirmOpen(true);
    } else {
      executeStatusUpdate(newStatus);
    }
  };

  const executeStatusUpdate = async (newStatus, resolutionDetails = '') => {
    setActionLoading(true);
    try {
      await complaintService.updateStatus(complaint._id, newStatus, resolutionDetails);
      success(`Status updated to "${newStatus}"`);
      setSelectedStatus(newStatus);
      await fetchComplaintAndMetadata();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
      setStatusConfirmOpen(false);
      setResolutionModalOpen(false);
    }
  };

  const handlePriorityUpdate = async () => {
    setActionLoading(true);
    try {
      await complaintService.updatePriority(complaint._id, selectedPriority);
      success(`Priority updated to "${selectedPriority}"`);
      await fetchComplaintAndMetadata();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update priority');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignmentUpdate = async () => {
    setActionLoading(true);
    try {
      await complaintService.assignDepartmentAndStaff(complaint._id, {
        departmentId: selectedDept || null,
        staffId: selectedStaff || null
      });
      success('Department & Staff successfully assigned');
      await fetchComplaintAndMetadata();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update assignment');
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
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/complaints"
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

        {complaint.status !== 'Resolved' && complaint.status !== 'Closed' && (
          <button
            onClick={() => setResolutionModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl transition shadow-lg shadow-emerald-200"
          >
            <CheckCircle2 className="w-4 h-4" />
            Resolve Complaint
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details, Controls, Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Admin Control Panel */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5 dark:bg-slate-900 dark:border-slate-800 transition-colors">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Administrative Control Actions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Change Status Workflow
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusSelectChange(e.target.value)}
                  disabled={actionLoading || complaint.status === 'Closed'}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition disabled:opacity-60"
                >
                  {STATUSES.filter((s) => s !== 'Closed' && s !== 'Pending Confirmation').map((s) => (
                    <option key={s} value={s} className="dark:bg-slate-800 dark:text-slate-100">
                      {s === 'Resolved' ? 'Resolved (Awaiting Student Confirmation)' : s}
                    </option>
                  ))}
                  {complaint.status === 'Pending Confirmation' && (
                    <option value="Pending Confirmation" disabled className="dark:bg-slate-800 dark:text-slate-100">
                      Pending Student Confirmation
                    </option>
                  )}
                  {complaint.status === 'Closed' && (
                    <option value="Closed" disabled className="dark:bg-slate-800 dark:text-slate-100">
                      Closed (Confirmed by Student)
                    </option>
                  )}
                </select>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Marking "Resolved" sends an email to the student to confirm & close the ticket.
                </p>
              </div>

              {/* Priority Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Set Severity / Priority
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p} className="dark:bg-slate-800 dark:text-slate-100">
                        {p}
                      </option>
                    ))}
                  </select>
                  {selectedPriority !== complaint.priority && (
                    <button
                      onClick={handlePriorityUpdate}
                      disabled={actionLoading}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shrink-0"
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Department & Staff Assignment */}
            <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/80 space-y-3 dark:bg-indigo-950/30 dark:border-indigo-900/50">
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 block">
                Assign Department & Designated Staff
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Department Dropdown */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={selectedDept}
                    onChange={(e) => {
                      setSelectedDept(e.target.value);
                      setSelectedStaff('');
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  >
                    <option value="" className="dark:bg-slate-800 dark:text-slate-100">Select Department...</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id} className="dark:bg-slate-800 dark:text-slate-100">
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Staff Member Dropdown */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Staff Member
                  </label>
                  <select
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  >
                    <option value="" className="dark:bg-slate-800 dark:text-slate-100">Assign Staff...</option>
                    {filteredStaff.map((s) => (
                      <option key={s._id} value={s._id} className="dark:bg-slate-800 dark:text-slate-100">
                        {s.name} ({s.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAssignmentUpdate}
                  disabled={actionLoading || (!selectedDept && !selectedStaff)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  Save Department / Staff Allocation
                </button>
              </div>
            </div>
          </div>

          {/* Problem Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 dark:bg-slate-900 dark:border-slate-800 transition-colors">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Student Grievance Details
            </h3>

            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Student: </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {complaint.submittedBy?.name} ({complaint.submittedBy?.studentId})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Email: </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{complaint.submittedBy?.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Phone: </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{complaint.submittedBy?.phone || 'Not provided'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Category: </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{complaint.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Location: </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{complaint.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Submitted: </span>
                  <span className="text-slate-700 dark:text-slate-300">{formatDate(complaint.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Resolution Details Card */}
          {complaint.resolutionDetails?.text && (
            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm space-y-3 dark:bg-emerald-950/30 dark:border-emerald-800/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Recorded Resolution Note
                </div>
                {complaint.resolvedAt && (
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    {formatDate(complaint.resolvedAt)}
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed bg-white/80 dark:bg-slate-900/80 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 whitespace-pre-wrap">
                {complaint.resolutionDetails.text}
              </p>
            </div>
          )}

          {/* Student Feedback & Rating Card if available */}
          {complaint.feedback && (
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-sm flex items-center justify-between text-xs dark:bg-amber-950/30 dark:border-amber-800/60">
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-200 block mb-1">Student Satisfaction Feedback</span>
                <p className="text-slate-600 dark:text-slate-300 italic">"{complaint.feedback.comment || 'No written comment'}"</p>
              </div>
              <div className="flex items-center gap-1 text-amber-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/60">
                {Array.from({ length: complaint.feedback.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
            </div>
          )}

          {/* Evidence Attachments */}
          <AttachmentViewer attachments={complaint.attachments} />

          {/* Comments & Activity Stream */}
          <ComplaintComments
            complaintId={complaint._id}
            comments={comments}
            onCommentAdded={handleCommentAdded}
          />
        </div>

        {/* Right Column: Timeline & Audit History */}
        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <ComplaintTimeline complaint={complaint} history={history} />

          {/* Audit History Log */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-colors">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Complete Audit Trail
            </h3>
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h._id} className="text-xs border-l-2 border-slate-200 dark:border-slate-700 pl-3 py-1 space-y-0.5">
                  <p className="font-bold text-slate-800 dark:text-slate-100">{h.action}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    By {h.performedBy?.name || 'Admin'} ({h.performedBy?.role || 'admin'})
                  </p>
                  {h.notes && <p className="text-slate-600 dark:text-slate-300 text-[11px] italic">"{h.notes}"</p>}
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{formatDate(h.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resolution Modal */}
      <ResolutionModal
        isOpen={resolutionModalOpen}
        onClose={() => setResolutionModalOpen(false)}
        onResolve={(text) => executeStatusUpdate('Resolved', text)}
        isLoading={actionLoading}
      />

      {/* Backward status transition warning */}
      <ConfirmDialog
        isOpen={statusConfirmOpen}
        onClose={() => {
          setStatusConfirmOpen(false);
          setSelectedStatus(complaint.status);
        }}
        onConfirm={() => executeStatusUpdate(pendingStatus)}
        title="Revert Status Warning"
        message={`Are you sure you want to move the complaint status backward from "${complaint.status}" to "${pendingStatus}"?`}
        confirmText="Confirm Status Reversal"
        type="warning"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default AdminComplaintDetails;
