import express from 'express';
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  closeComplaint,
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

router.post('/', authorize('student'), uploadAttachments, createComplaint);
router.get('/my', authorize('student'), getMyComplaints);
router.get('/:id', getComplaintById);
router.put('/:id', uploadAttachments, updateComplaint);
router.post('/:id/close', closeComplaint);
router.post('/:id/comments', addComment);
router.post('/:id/feedback', authorize('student'), submitFeedback);
router.get('/:id/feedback', getFeedback);

export default router;
