import Complaint, { COMPLAINT_PRIORITIES, COMPLAINT_STATUSES } from '../models/Complaint.js';
import Department from '../models/Department.js';
import Staff from '../models/Staff.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { logComplaintHistory } from '../services/complaintService.js';
import { sendStatusUpdateEmail, sendResolutionConfirmationEmail } from '../services/emailService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// Helper to auto-close pending confirmation complaints older than 3 days
const autoCloseExpiredPendingComplaints = async () => {
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const expiredList = await Complaint.find({
      status: 'Pending Confirmation',
      $or: [
        { pendingConfirmationSince: { $lte: threeDaysAgo } },
        { pendingConfirmationSince: null, resolvedAt: { $lte: threeDaysAgo } }
      ]
    });

    for (const comp of expiredList) {
      comp.status = 'Closed';
      comp.closedAt = new Date();
      await comp.save();

      await logComplaintHistory({
        complaintId: comp._id,
        action: 'Auto-Closed (No Response After 3 Days)',
        performedBy: comp.submittedBy,
        previousValue: 'Pending Confirmation',
        newValue: 'Closed',
        notes: 'Ticket automatically closed after 3 days without student response.'
      });
    }
  } catch (err) {
    console.error('Error during auto-close check:', err.message);
  }
};

// @desc    Get all complaints with advanced filtering & pagination
// @route   GET /api/admin/complaints
// @access  Private (Admin)
export const getAllComplaints = async (req, res, next) => {
  try {
    // Check and auto-close any tickets in Pending Confirmation older than 3 days
    await autoCloseExpiredPendingComplaints();

    const {
      search,
      status,
      category,
      department,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (department && department !== 'all') {
      query.assignedDepartment = department;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate('submittedBy', 'name email studentId phone department year')
        .populate('assignedDepartment', 'name')
        .populate('assignedStaff', 'name email phone designation')
        .populate('feedback')
        .lean(),
      Complaint.countDocuments(query)
    ]);

    return sendSuccess(res, 200, 'All complaints fetched successfully', {
      complaints,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PUT /api/admin/complaints/:id/status
// @access  Private (Admin)
export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionDetails } = req.body;

    if (!COMPLAINT_STATUSES.includes(status)) {
      return sendError(res, 400, `Invalid status. Must be one of: ${COMPLAINT_STATUSES.join(', ')}`);
    }

    const complaint = await Complaint.findById(id).populate('submittedBy', 'name email studentId department');
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found');
    }

    const previousStatus = complaint.status;

    // Two-Way Closure: When an admin marks an issue as Resolved, state changes to Pending Confirmation
    let targetStatus = status;
    if (status === 'Closed') {
      return sendError(
        res,
        400,
        'Complaints cannot be directly closed by Admin. Please mark the complaint as "Resolved", and it will be Closed once the student confirms the resolution.'
      );
    }

    if (status === 'Resolved') {
      targetStatus = 'Pending Confirmation';
      complaint.status = 'Pending Confirmation';
      complaint.resolvedAt = new Date();
      complaint.pendingConfirmationSince = new Date();
      if (resolutionDetails) {
        complaint.resolutionDetails = {
          text: resolutionDetails.trim(),
          resolvedBy: req.user._id,
          resolvedAt: new Date()
        };
      }
    } else {
      complaint.status = status;
    }

    await complaint.save();

    const historyAction = status === 'Resolved'
      ? 'Resolution Proposed (Pending Confirmation)'
      : 'Status Changed';

    const historyNotes = status === 'Resolved'
      ? `Admin marked ticket as Resolved: "${resolutionDetails ? resolutionDetails.trim() : 'Work completed'}". Pending student confirmation.`
      : `Status changed from ${previousStatus} to ${status} by Admin (${req.user.name})`;

    await logComplaintHistory({
      complaintId: complaint._id,
      action: historyAction,
      performedBy: req.user._id,
      previousValue: previousStatus,
      newValue: targetStatus,
      notes: historyNotes
    });

    const updated = await Complaint.findById(complaint._id)
      .populate('submittedBy', 'name email studentId department')
      .populate('assignedDepartment', 'name')
      .populate('assignedStaff', 'name designation')
      .lean();

    // Send email notification to student
    if (complaint.submittedBy?.email) {
      if (status === 'Resolved') {
        sendResolutionConfirmationEmail({
          toEmail: complaint.submittedBy.email,
          studentName: complaint.submittedBy.name,
          complaintId: complaint.complaintId,
          complaintTitle: complaint.title,
          resolutionNotes: resolutionDetails || '',
          complaintMongoId: complaint._id
        });
      } else {
        sendStatusUpdateEmail({
          toEmail: complaint.submittedBy.email,
          studentName: complaint.submittedBy.name,
          complaintId: complaint.complaintId,
          complaintTitle: complaint.title,
          oldStatus: previousStatus,
          newStatus: status,
          notes: resolutionDetails || `Status updated to ${status}`,
          assignedDept: updated?.assignedDepartment?.name || '',
          assignedStaff: updated?.assignedStaff?.name || ''
        });
      }
    }

    return sendSuccess(res, 200, `Complaint status updated to ${targetStatus}`, updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint priority
// @route   PUT /api/admin/complaints/:id/priority
// @access  Private (Admin)
export const updatePriority = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    if (!COMPLAINT_PRIORITIES.includes(priority)) {
      return sendError(res, 400, `Invalid priority. Must be one of: ${COMPLAINT_PRIORITIES.join(', ')}`);
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found');
    }

    const previousPriority = complaint.priority;
    complaint.priority = priority;
    await complaint.save();

    await logComplaintHistory({
      complaintId: complaint._id,
      action: 'Priority Changed',
      performedBy: req.user._id,
      previousValue: previousPriority,
      newValue: priority,
      notes: `Priority updated from ${previousPriority} to ${priority}`
    });

    return sendSuccess(res, 200, `Priority updated to ${priority}`, complaint);
  } catch (error) {
    next(error);
  }
};

// @desc    Assign department and/or staff to complaint
// @route   PUT /api/admin/complaints/:id/assign
// @access  Private (Admin)
export const assignDepartmentAndStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { departmentId, staffId } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found');
    }

    let deptName = '';
    let staffName = '';

    if (departmentId) {
      const department = await Department.findById(departmentId);
      if (!department) {
        return sendError(res, 404, 'Department not found');
      }
      complaint.assignedDepartment = department._id;
      deptName = department.name;

      await logComplaintHistory({
        complaintId: complaint._id,
        action: 'Department Assigned',
        performedBy: req.user._id,
        previousValue: '',
        newValue: department.name,
        notes: `Assigned to ${department.name}`
      });
    }

    if (staffId) {
      const staff = await Staff.findById(staffId);
      if (!staff) {
        return sendError(res, 404, 'Staff not found');
      }
      complaint.assignedStaff = staff._id;
      staffName = staff.name;

      await logComplaintHistory({
        complaintId: complaint._id,
        action: 'Staff Assigned',
        performedBy: req.user._id,
        previousValue: '',
        newValue: staff.name,
        notes: `Assigned to staff member ${staff.name} (${staff.designation})`
      });
    }

    // Automatically transition to 'Assigned' if currently Submitted or Under Review
    if (['Submitted', 'Under Review'].includes(complaint.status)) {
      complaint.status = 'Assigned';
      await logComplaintHistory({
        complaintId: complaint._id,
        action: 'Status Changed',
        performedBy: req.user._id,
        previousValue: 'Under Review',
        newValue: 'Assigned',
        notes: 'Complaint moved to Assigned status upon allocation'
      });
    }

    await complaint.save();

    const updated = await Complaint.findById(complaint._id)
      .populate('submittedBy', 'name email studentId')
      .populate('assignedDepartment', 'name')
      .populate('assignedStaff', 'name email designation phone')
      .lean();

    // Send assignment notification email to student
    if (updated.submittedBy?.email) {
      sendStatusUpdateEmail({
        toEmail: updated.submittedBy.email,
        studentName: updated.submittedBy.name,
        complaintId: updated.complaintId,
        complaintTitle: updated.title,
        oldStatus: complaint.status,
        newStatus: complaint.status,
        notes: `Ticket assigned to ${deptName || 'Department'}${staffName ? ` - Staff In-Charge: ${staffName}` : ''}`,
        assignedDept: deptName,
        assignedStaff: staffName
      });
    }

    return sendSuccess(res, 200, 'Department and Staff assigned successfully', updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Add resolution details and mark as Resolved (Pending Student Confirmation)
// @route   PUT /api/admin/complaints/:id/resolve
// @access  Private (Admin)
export const resolveComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolutionText } = req.body;

    if (!resolutionText || resolutionText.trim().length === 0) {
      return sendError(res, 400, 'Resolution details are required to resolve the complaint');
    }

    const complaint = await Complaint.findById(id).populate('submittedBy', 'name email studentId');
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found');
    }

    const previousStatus = complaint.status;
    // Two-Way Closure: Set to Pending Confirmation
    complaint.status = 'Pending Confirmation';
    complaint.resolvedAt = new Date();
    complaint.pendingConfirmationSince = new Date();
    complaint.resolutionDetails = {
      text: resolutionText.trim(),
      resolvedBy: req.user._id,
      resolvedAt: new Date()
    };

    await complaint.save();

    await logComplaintHistory({
      complaintId: complaint._id,
      action: 'Resolution Proposed (Pending Confirmation)',
      performedBy: req.user._id,
      previousValue: previousStatus,
      newValue: 'Pending Confirmation',
      notes: `Resolution: "${resolutionText.trim().slice(0, 80)}...". Awaiting student verification.`
    });

    const updated = await Complaint.findById(complaint._id)
      .populate('submittedBy', 'name email studentId')
      .populate('assignedDepartment', 'name')
      .populate('assignedStaff', 'name designation')
      .populate('resolutionDetails.resolvedBy', 'name role')
      .lean();

    // Send Two-Way Closure confirmation email to student
    if (complaint.submittedBy?.email) {
      sendResolutionConfirmationEmail({
        toEmail: complaint.submittedBy.email,
        studentName: complaint.submittedBy.name,
        complaintId: complaint.complaintId,
        complaintTitle: complaint.title,
        resolutionNotes: resolutionText.trim(),
        complaintMongoId: complaint._id
      });
    }

    return sendSuccess(res, 200, 'Complaint marked as resolved. Pending student confirmation.', updated);
  } catch (error) {
    next(error);
  }
};
