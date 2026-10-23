import express from 'express';
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  closeComplaint,
  confirmResolution,
  reopenComplaint,
  addComment,
  submitFeedback,
  getFeedback
} from '../controllers/complaintController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { uploadAttachments } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Protected for all authenticated users
router.use(protect);

router.post('/', authorize('student', 'admin'), uploadAttachments, createComplaint);
router.get('/my', authorize('student', 'admin'), getMyComplaints);
router.get('/:id', getComplaintById);
router.put('/:id', uploadAttachments, updateComplaint);
router.post('/:id/close', closeComplaint);
router.post('/:id/confirm-resolution', confirmResolution);
router.post('/:id/reopen', reopenComplaint);
router.post('/:id/comments', addComment);
router.post('/:id/feedback', authorize('student', 'admin'), submitFeedback);
router.get('/:id/feedback', getFeedback);

export default router;
