import Complaint from '../models/Complaint.js';
import ComplaintHistory from '../models/ComplaintHistory.js';
import Department from '../models/Department.js';
import Staff from '../models/Staff.js';
import User from '../models/User.js';
import { sendSuccess } from '../utils/responseHandler.js';

// @desc    Get student dashboard metrics
// @route   GET /api/student/dashboard
// @access  Private (Student)
export const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const [total, submitted, underReview, assigned, inProgress, resolved, closed, recentComplaints] =
      await Promise.all([
        Complaint.countDocuments({ submittedBy: studentId }),
        Complaint.countDocuments({ submittedBy: studentId, status: 'Submitted' }),
        Complaint.countDocuments({ submittedBy: studentId, status: 'Under Review' }),
        Complaint.countDocuments({ submittedBy: studentId, status: 'Assigned' }),
        Complaint.countDocuments({ submittedBy: studentId, status: 'In Progress' }),
        Complaint.countDocuments({ submittedBy: studentId, status: 'Resolved' }),
        Complaint.countDocuments({ submittedBy: studentId, status: 'Closed' }),
        Complaint.find({ submittedBy: studentId })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('assignedDepartment', 'name')
          .lean()
      ]);

    const stats = {
      total,
      submitted,
      underReview,
      inProgress: assigned + inProgress,
      resolved,
      closed
    };

    return sendSuccess(res, 200, 'Student dashboard stats retrieved', {
      stats,
      recentComplaints
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard metrics & analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      total,
      submitted,
      underReview,
      assigned,
      inProgress,
      resolved,
      closed,
      critical,
      totalStudents,
      totalStaff,
      totalDepartments,
      byStatusRaw,
      byCategoryRaw,
      byPriorityRaw,
      recentComplaints,
      recentActivities
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Submitted' }),
      Complaint.countDocuments({ status: 'Under Review' }),
      Complaint.countDocuments({ status: 'Assigned' }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.countDocuments({ status: 'Closed' }),
      Complaint.countDocuments({ priority: 'Critical', status: { $ne: 'Closed' } }),
      User.countDocuments({ role: 'student' }),
      Staff.countDocuments(),
      Department.countDocuments(),
      Complaint.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Complaint.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Complaint.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('submittedBy', 'name email studentId')
        .populate('assignedDepartment', 'name')
        .lean(),
      ComplaintHistory.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('performedBy', 'name role')
        .populate('complaint', 'complaintId title')
        .lean()
    ]);

    // Format aggregations for chart consumption
    const byStatus = byStatusRaw.map((item) => ({ name: item._id, value: item.count }));
    const byCategory = byCategoryRaw.map((item) => ({ name: item._id, value: item.count }));
    const byPriority = byPriorityRaw.map((item) => ({ name: item._id, value: item.count }));

    // Monthly trend calculation
    const monthlyTrendRaw = await Complaint.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrend = monthlyTrendRaw.map((item) => ({
      name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      complaints: item.count
    }));

    const stats = {
      total,
      submitted,
      underReview,
      assigned,
      inProgress,
      resolved,
      closed,
      critical,
      totalStudents,
      totalStaff,
      totalDepartments
    };

    return sendSuccess(res, 200, 'Admin dashboard stats retrieved', {
      stats,
      charts: {
        byStatus,
        byCategory,
        byPriority,
        monthlyTrend
      },
      recentComplaints,
      recentActivities
    });
  } catch (error) {
    next(error);
  }
};
