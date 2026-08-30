import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'ccms_super_secret_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register new student
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, studentId, phone, department, year } = req.body;

    // Validation
    if (!name || !email || !password) {
      return sendError(res, 400, 'Please provide name, email, and password');
    }

    if (password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters long');
    }

    if (confirmPassword && password !== confirmPassword) {
      return sendError(res, 400, 'Passwords do not match');
    }

    // Check if user already exists with email
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return sendError(res, 400, 'An account with this email already exists');
    }

    // Check studentId uniqueness if provided
    if (studentId) {
      const existingStudentId = await User.findOne({ studentId });
      if (existingStudentId) {
        return sendError(res, 400, 'A student with this Student ID is already registered');
      }
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      studentId: studentId || `STU-${Date.now().toString().slice(-4)}`,
      phone: phone || '',
      department: department || 'General',
      year: year || '1st Year',
      role: 'student'
    });

    const token = generateToken(user._id, user.role);

    return sendSuccess(
      res,
      201,
      'Registration successful',
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          studentId: user.studentId,
          phone: user.phone,
          department: user.department,
          year: user.year,
          role: user.role,
          profileImage: user.profileImage
        }
      }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Please provide both email and password');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const token = generateToken(user._id, user.role);

    return sendSuccess(
      res,
      200,
      'Login successful',
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          studentId: user.studentId,
          phone: user.phone,
          department: user.department,
          year: user.year,
          role: user.role,
          profileImage: user.profileImage
        }
      }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, 200, 'Current user profile fetched', {
      id: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      phone: user.phone,
      department: user.department,
      year: user.year,
      role: user.role,
      profileImage: user.profileImage,
      createdAt: user.createdAt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department, year, profileImage } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (year !== undefined) user.year = year;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    return sendSuccess(res, 200, 'Profile updated successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      phone: user.phone,
      department: user.department,
      year: user.year,
      role: user.role,
      profileImage: user.profileImage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (client clears token)
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  return sendSuccess(res, 200, 'Logged out successfully');
};
