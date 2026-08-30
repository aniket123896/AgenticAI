import Complaint, { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES } from '../models/Complaint.js';
import ComplaintHistory from '../models/ComplaintHistory.js';
import Comment from '../models/Comment.js';
import Feedback from '../models/Feedback.js';
import { generateComplaintId } from '../services/idGeneratorService.js';
import { logComplaintHistory } from '../services/complaintService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

const getEntityId = (entity) => {
  if (!entity) return '';
  if (typeof entity === 'object' && entity._id) return String(entity._id);
  return String(entity);
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, location, priority = 'Medium' } = req.body;

    // Validation
    if (!title || title.trim().length < 5 || title.trim().length > 100) {
      return sendError(res, 400, 'Title is required and must be between 5 and 100 characters');
    }

    if (!description || description.trim().length < 20) {
      return sendError(res, 400, 'Description is required and must be at least 20 characters');
    }

    if (!category || !COMPLAINT_CATEGORIES.includes(category)) {
      return sendError(res, 400, `Category is required and must be one of: ${COMPLAINT_CATEGORIES.join(', ')}`);
    }

    if (!location || location.trim().length === 0) {
      return sendError(res, 400, 'Location is required');
    }

    if (priority === 'Critical' && req.user.role === 'student') {
      return sendError(res, 400, 'Students cannot set Critical priority directly. Admin will assign if warranted.');
    }

    const complaintPriority = COMPLAINT_PRIORITIES.includes(priority) ? priority : 'Medium';
    const complaintId = await generateComplaintId();

    // Process attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        attachments.push({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          url: `/uploads/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size
        });
      });
    }

    const complaint = await Complaint.create({
      complaintId,
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      priority: complaintPriority,
      status: 'Submitted',
      submittedBy: String(req.user._id || req.user.id),
      attachments
    });

    // Log history
    await logComplaintHistory({
      complaintId: complaint._id,
      action: 'Complaint Created',
      performedBy: req.user._id,
      previousValue: '',
      newValue: 'Submitted',
      notes: `Complaint ${complaintId} created by ${req.user.name}`
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('submittedBy', 'name email studentId department phone year')
      .lean();

    return sendSuccess(res, 201, 'Complaint submitted successfully', populatedComplaint);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in student's complaints
// @route   GET /api/complaints/my
// @access  Private (Student)
export const getMyComplaints = async (req, res, next) => {
  try {
    const {
      search,
      status,
      category,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const studentId = String(req.user._id || req.user.id);
    const query = { submittedBy: studentId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
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
        .populate('assignedDepartment', 'name')
        .populate('assignedStaff', 'name email phone designation')
        .populate('feedback')
        .lean(),
      Complaint.countDocuments(query)
    ]);

    return sendSuccess(res, 200, 'Complaints fetched successfully', {
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

// @desc    Get single complaint details
// @route   GET /api/complaints/:id
// @access  Private
export const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let complaint;
    if (id.startsWith('CMP-')) {
      complaint = await Complaint.findOne({ complaintId: id });
    } else {
      complaint = await Complaint.findById(id);
    }

    if (!complaint) {
      return sendError(res, 404, 'Complaint not found');
    }

    const submittedById = getEntityId(complaint.submittedBy);
    const currentUserId = getEntityId(req.user._id || req.user.id);

    // Role check: Students can only view their own complaints
    if (req.user.role === 'student' && submittedById !== currentUserId) {
      return sendError(res, 403, 'Access denied: You can only view your own complaints');
    }

    await complaint.populate([
      { path: 'submittedBy', select: 'name email studentId phone department year' },
      { path: 'assignedDepartment', select: 'name description' },
      { path: 'assignedStaff', select: 'name email phone designation' },
      { path: 'resolutionDetails.resolvedBy', select: 'name email role' },
      { path: 'feedback' }
    ]);

    // Fetch history and comments
    const [history, comments] = await Promise.all([
      ComplaintHistory.find({ complaint: complaint._id })
        .sort({ createdAt: 1 })
        .populate('performedBy', 'name role')
        .lean(),
      Comment.find({ complaint: complaint._id })
        .sort({ createdAt: 1 })
        .populate('user', 'name role profileImage')
        .lean()
    ]);

    return sendSuccess(res, 200, 'Complaint details retrieved', {
      complaint,
      history,
      comments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint (Student can only edit if still in Submitted status)
// @route   PUT /api/complaints/:id
// @access  Private (Student)
export const updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, location, priority } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found');
    }

    const submittedById = getEntityId(complaint.submittedBy);
    const currentUserId = getEntityId(req.user._id || req.user.id);

    if (submittedById !== currentUserId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized to edit this complaint');
    }

    if (req.user.role === 'student' && complaint.status !== 'Submitted') {
      return sendError(res, 400, 'Cannot edit complaint after it is under review or in progress');
    }

    if (title) complaint.title = title.trim();
    if (description) complaint.description = description.trim();
    if (category && COMPLAINT_CATEGORIES.includes(category)) complaint.category = category;
    if (location) complaint.location = location.trim();
    if (priority && COMPLAINT_PRIORITIES.includes(priority) && (req.user.role === 'admin' || priority !== 'Critical')) {
      complaint.priority = priority;
    }

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        complaint.attachments.push({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          url: `/uploads/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size
        });
      });
    }

    await complaint.save();

    await logComplaintHistory({
      complaintId: complaint._id,
      action: 'Status Changed',
      performedBy: req.user._id,
      previousValue: '',
      newValue: complaint.status,
      notes: `Complaint updated by ${req.user.name}`
    });

    return sendSuccess(res, 200, 'Complaint updated successfully', complaint);
  } catch (error) {
    next(error);
  }
};

// @desc    Close a resolved complaint
// @route   POST /api/complaints/:id/close
// @access  Private (Student or Admin)
export const closeComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return sendError(res, 404, 'Complaint not found');
    }

    const submittedById = getEntityId(complaint.submittedBy);
    const currentUserId = getEntityId(req.user._id || req.user.id);

    if (req.user.role === 'student' && submittedById !== currentUserId) {
      return sendError(res, 403, 'Not authorized to close this complaint');
    }

    if (complaint.status !== 'Resolved' && req.user.role === 'student') {
      return sendError(res, 400, 'Only resolved complaints can be marked as closed');
    }

    const previousStatus = complaint.status;
    complaint.status = 'Closed';
    complaint.closedAt = new Date();
    await complaint.save();

    await logComplaintHistory({
      complaintId: complaint._id,
      action: 'Complaint Closed',
      performedBy: req.user._id,
      previousValue: previousStatus,
      newValue: 'Closed',
      notes: `Complaint marked as Closed by ${req.user.name} (${req.user.role})`
    });

    return sendSuccess(res, 200, 'Complaint closed successfully', complaint);
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment / update on complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return sendError(res, 400, 'Comment text is required');
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found');
    }

    const submittedById = getEntityId(complaint.submittedBy);
    const currentUserId = getEntityId(req.user._id || req.user.id);

    if (req.user.role === 'student' && submittedById !== currentUserId) {
      return sendError(res, 403, 'Not authorized to comment on this complaint');
    }

    const newComment = await Comment.create({
      complaint: String(complaint._id),
      user: String(req.user._id || req.user.id),
      comment: comment.trim()
    });

    await logComplaintHistory({
      complaintId: complaint._id,
      action: 'Comment Added',
      performedBy: req.user._id,
      previousValue: '',
      newValue: 'Comment',
      notes: `${req.user.role === 'admin' ? 'Admin' : 'Student'} comment: "${comment.trim().slice(0, 40)}..."`
    });

    const populatedComment = await Comment.findById(newComment._id).populate('user', 'name role profileImage');

    return sendSuccess(res, 201, 'Comment added successfully', populatedComment);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit feedback/rating after resolution
// @route   POST /api/complaints/:id/feedback
// @access  Private (Student)
export const submitFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment = '' } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return sendError(res, 400, 'Rating is required and must be between 1 and 5');
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found');
    }

    const submittedById = getEntityId(complaint.submittedBy);
    const currentUserId = getEntityId(req.user._id || req.user.id);

    if (submittedById !== currentUserId) {
      return sendError(res, 403, 'You can only provide feedback for your own complaints');
    }

    if (!['Resolved', 'Closed'].includes(complaint.status)) {
      return sendError(res, 400, 'Feedback can only be submitted for resolved or closed complaints');
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ complaint: complaint._id });
    if (existingFeedback) {
      return sendError(res, 400, 'Feedback has already been submitted for this complaint');
    }

    const feedback = await Feedback.create({
      complaint: String(complaint._id),
      student: String(req.user._id || req.user.id),
      rating: Number(rating),
      comment: comment.trim()
    });

    complaint.feedback = feedback._id;
    await complaint.save();

    await logComplaintHistory({
      complaintId: complaint._id,
      action: 'Feedback Submitted',
      performedBy: req.user._id,
      previousValue: '',
      newValue: `${rating} Stars`,
      notes: comment ? `Student feedback: "${comment.trim()}"` : `Student gave ${rating} stars`
    });

    return sendSuccess(res, 201, 'Feedback submitted successfully', feedback);
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback for a complaint
// @route   GET /api/complaints/:id/feedback
// @access  Private
export const getFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findOne({ complaint: id }).populate('student', 'name studentId department');

    if (!feedback) {
      return sendError(res, 404, 'No feedback found for this complaint');
    }

    return sendSuccess(res, 200, 'Feedback retrieved', feedback);
  } catch (error) {
    next(error);
  }
};
