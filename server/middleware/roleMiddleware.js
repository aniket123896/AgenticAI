import { sendError } from '../utils/responseHandler.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access forbidden: User role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource`
      );
    }
    next();
  };
};
