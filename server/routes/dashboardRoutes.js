import express from 'express';
import { getStudentDashboard, getAdminDashboard } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/student', authorize('student'), getStudentDashboard);
router.get('/admin', authorize('admin'), getAdminDashboard);

export default router;
