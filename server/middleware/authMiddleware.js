import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendError } from '../utils/responseHandler.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized to access this route, token missing');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ccms_super_secret_jwt_key_2026');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 401, 'User belonging to this token no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 401, 'Not authorized to access this route, invalid or expired token');
  }
};
