import Department from '../models/Department.js';
import Staff from '../models/Staff.js';
import Complaint from '../models/Complaint.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public or Private
export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 }).lean();

    // Include staff count and complaint count for each department
    const enriched = await Promise.all(
      departments.map(async (dept) => {
        const staffCount = await Staff.countDocuments({ department: dept._id });
        const activeComplaints = await Complaint.countDocuments({
          assignedDepartment: dept._id,
          status: { $nin: ['Closed'] }
        });
        return {
          ...dept,
          staffCount,
          activeComplaints
        };
      })
    );

    return sendSuccess(res, 200, 'Departments retrieved', enriched);
  } catch (error) {
    next(error);
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private (Admin)
export const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return sendError(res, 400, 'Department name is required');
    }

    const existing = await Department.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      return sendError(res, 400, 'A department with this name already exists');
    }

    const department = await Department.create({
      name: name.trim(),
      description: description ? description.trim() : ''
    });

    return sendSuccess(res, 201, 'Department created successfully', department);
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin)
export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return sendError(res, 404, 'Department not found');
    }

    if (name) {
      const existing = await Department.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
      });
      if (existing) {
        return sendError(res, 400, 'Another department with this name already exists');
      }
      department.name = name.trim();
    }

    if (description !== undefined) {
      department.description = description.trim();
    }

    await department.save();

    return sendSuccess(res, 200, 'Department updated successfully', department);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
export const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);
    if (!department) {
      return sendError(res, 404, 'Department not found');
    }

    // Check if staff assigned
    const staffCount = await Staff.countDocuments({ department: id });
    if (staffCount > 0) {
      return sendError(res, 400, `Cannot delete department: ${staffCount} staff members are assigned to it`);
    }

    // Reassign complaints if any
    await Complaint.updateMany({ assignedDepartment: id }, { $set: { assignedDepartment: null } });

    await department.deleteOne();

    return sendSuccess(res, 200, 'Department deleted successfully');
  } catch (error) {
    next(error);
  }
};
