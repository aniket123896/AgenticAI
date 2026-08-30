import express from 'express';
import {
  getAllComplaints,
  updateStatus,
  updatePriority,
  assignDepartmentAndStaff,
  resolveComplaint
} from '../controllers/adminController.js';
import { getComplaintById, addComment } from '../controllers/complaintController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Restrict all routes to Admin only
router.use(protect, authorize('admin'));

router.get('/complaints', getAllComplaints);
router.get('/complaints/:id', getComplaintById);
router.put('/complaints/:id/status', updateStatus);
router.put('/complaints/:id/priority', updatePriority);
router.put('/complaints/:id/assign', assignDepartmentAndStaff);
router.post('/complaints/:id/comments', addComment);
router.put('/complaints/:id/resolve', resolveComplaint);

export default router;
