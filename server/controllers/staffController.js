import Staff from '../models/Staff.js';
import Department from '../models/Department.js';
import Complaint from '../models/Complaint.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// @desc    Get all staff members (filter by department if provided)
// @route   GET /api/staff
// @access  Private
export const getStaff = async (req, res, next) => {
  try {
    const { department } = req.query;
    const query = {};

    if (department && department !== 'all') {
      query.department = department;
    }

    const staff = await Staff.find(query)
      .populate('department', 'name')
      .sort({ name: 1 })
      .lean();

    const enriched = await Promise.all(
      staff.map(async (member) => {
        const assignedComplaints = await Complaint.countDocuments({
          assignedStaff: member._id,
          status: { $nin: ['Closed'] }
        });
        return {
          ...member,
          activeComplaints: assignedComplaints
        };
      })
    );

    return sendSuccess(res, 200, 'Staff members retrieved', enriched);
  } catch (error) {
    next(error);
  }
};

// @desc    Create staff member
// @route   POST /api/staff
// @access  Private (Admin)
export const createStaff = async (req, res, next) => {
  try {
    const { name, email, phone, department, designation } = req.body;

    if (!name || !email || !department || !designation) {
      return sendError(res, 400, 'Please provide name, email, department, and designation');
    }

    const deptDoc = await Department.findById(department);
    if (!deptDoc) {
      return sendError(res, 404, 'Selected department does not exist');
    }

    const staff = await Staff.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      department,
      designation: designation.trim()
    });

    const populated = await Staff.findById(staff._id).populate('department', 'name');

    return sendSuccess(res, 201, 'Staff member created successfully', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private (Admin)
export const updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, department, designation } = req.body;

    const staff = await Staff.findById(id);
    if (!staff) {
      return sendError(res, 404, 'Staff member not found');
    }

    if (name) staff.name = name.trim();
    if (email) staff.email = email.trim().toLowerCase();
    if (phone !== undefined) staff.phone = phone.trim();
    if (designation) staff.designation = designation.trim();

    if (department) {
      const deptDoc = await Department.findById(department);
      if (!deptDoc) {
        return sendError(res, 404, 'Department does not exist');
      }
      staff.department = department;
    }

    await staff.save();

    const populated = await Staff.findById(staff._id).populate('department', 'name');

    return sendSuccess(res, 200, 'Staff member updated successfully', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private (Admin)
export const deleteStaff = async (req, res, next) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findById(id);
    if (!staff) {
      return sendError(res, 404, 'Staff member not found');
    }

    // Reassign complaints if any
    await Complaint.updateMany({ assignedStaff: id }, { $set: { assignedStaff: null } });

    await staff.deleteOne();

    return sendSuccess(res, 200, 'Staff member deleted successfully');
  } catch (error) {
    next(error);
  }
};
