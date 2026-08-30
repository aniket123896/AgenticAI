import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      User.countDocuments(query)
    ]);

    // Enrich with complaint count
    const enriched = await Promise.all(
      users.map(async (u) => {
        const complaintCount = await Complaint.countDocuments({ submittedBy: u._id });
        return {
          ...u,
          complaintCount
        };
      })
    );

    return sendSuccess(res, 200, 'Users fetched successfully', {
      users: enriched,
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

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin)
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password').lean();

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const complaints = await Complaint.find({ submittedBy: id }).sort({ createdAt: -1 }).lean();

    return sendSuccess(res, 200, 'User details retrieved', { user, complaints });
  } catch (error) {
    next(error);
  }
};
