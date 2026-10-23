import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { sendOtpEmail } from '../services/emailService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'ccms_super_secret_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Send OTP to student email for registration or login
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req, res, next) => {
  try {
    const { email, purpose = 'login' } = req.body;

    if (!email) {
      return sendError(res, 400, 'Please provide a valid Gmail/email address');
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (purpose === 'register') {
      const existing = await User.findOne({ email: normalizedEmail }).select('_id');
      if (existing) {
        return sendError(res, 400, 'An account with this email already exists. Please log in.');
      }
    } else if (purpose === 'login') {
      const existing = await User.findOne({ email: normalizedEmail }).select('_id role');
      if (!existing) {
        return sendError(res, 404, 'No account found with this email. Please register first.');
      }
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate prior OTPs for this email & purpose
    await Otp.deleteMany({ email: normalizedEmail, purpose });

    await Otp.create({
      email: normalizedEmail,
      otp,
      purpose,
      expiresAt
    });

    // Send email notification to user's email address
    const emailResult = await sendOtpEmail(normalizedEmail, otp, purpose);

    if (!emailResult?.sent) {
      if (emailResult?.error) {
        return sendError(
          res,
          500,
          `Failed to deliver email: ${emailResult.error}. Please check EMAIL_USER and EMAIL_PASS in server/.env`
        );
      }
      // Dev / Demo fallback when EMAIL_USER is not configured in .env
      return sendSuccess(
        res,
        200,
        `Demo Mode OTP: ${otp} (Enter this code, or configure EMAIL_USER in server/.env for real emails)`,
        {
          email: normalizedEmail,
          purpose,
          devOtp: otp
        }
      );
    }

    return sendSuccess(res, 200, `Verification code successfully sent to ${normalizedEmail}`, {
      email: normalizedEmail,
      purpose
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp, purpose = 'login' } = req.body;

    if (!email || !otp) {
      return sendError(res, 400, 'Please provide both email and verification code');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const validOtp = await Otp.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
      purpose,
      expiresAt: { $gt: new Date() }
    });

    if (!validOtp) {
      return sendError(res, 400, 'Invalid or expired verification code');
    }

    return sendSuccess(res, 200, 'Verification code verified successfully', {
      email: normalizedEmail,
      verified: true
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register new student
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, studentId, phone, department, year, otp } = req.body;

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

    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP for registration
    if (!otp) {
      return sendError(res, 400, 'Email verification required. Please request and enter the 6-digit OTP sent to your email.');
    }

    const validOtp = await Otp.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
      purpose: 'register',
      expiresAt: { $gt: new Date() }
    });

    if (!validOtp) {
      return sendError(res, 400, 'Invalid or expired verification code. Please request a new OTP.');
    }

    await Otp.deleteMany({ email: normalizedEmail, purpose: 'register' });

    // Parallelize unique checks to reduce database round-trip latency
    const [existingEmail, existingStudentId] = await Promise.all([
      User.findOne({ email: normalizedEmail }).select('_id'),
      studentId ? User.findOne({ studentId }).select('_id') : Promise.resolve(null)
    ]);

    if (existingEmail) {
      return sendError(res, 400, 'An account with this email already exists');
    }

    if (existingStudentId) {
      return sendError(res, 400, 'A student with this Student ID is already registered');
    }

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
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

// @desc    Authenticate user & get token (supports OTP or Password)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password, otp } = req.body;

    if (!email) {
      return sendError(res, 400, 'Please provide your email address');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. If OTP is provided, verify OTP authentication
    if (otp) {
      const validOtp = await Otp.findOne({
        email: normalizedEmail,
        otp: otp.trim(),
        purpose: 'login',
        expiresAt: { $gt: new Date() }
      });

      if (!validOtp) {
        return sendError(res, 401, 'Invalid or expired verification code');
      }

      await Otp.deleteMany({ email: normalizedEmail, purpose: 'login' });

      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return sendError(res, 404, 'User account not found');
      }

      const token = generateToken(user._id, user.role);

      return sendSuccess(
        res,
        200,
        'OTP Login successful',
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
    }

    // 2. Otherwise verify via standard password
    if (!password) {
      return sendError(res, 400, 'Please provide either password or verification OTP');
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
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
