import express from 'express';
import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff
} from '../controllers/staffController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getStaff);
router.post('/', authorize('admin'), createStaff);
router.put('/:id', authorize('admin'), updateStaff);
router.delete('/:id', authorize('admin'), deleteStaff);

export default router;
