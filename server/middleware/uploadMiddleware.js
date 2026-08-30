import multer from 'multer';
import { upload } from '../config/upload.js';
import { sendError } from '../utils/responseHandler.js';

export const uploadAttachments = (req, res, next) => {
  const uploadHandler = upload.array('attachments', 5);

  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendError(res, 400, 'File size too large. Maximum size per file is 5 MB.');
      }
      if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
        return sendError(res, 400, 'Too many files uploaded. Maximum 5 attachments allowed.');
      }
      return sendError(res, 400, `Upload error: ${err.message}`);
    } else if (err) {
      return sendError(res, 400, err.message || 'File upload error occurred.');
    }
    next();
  });
};
