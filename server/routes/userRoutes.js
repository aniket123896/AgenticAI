import express from 'express';
import { getAllUsers, getUserById } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);

export default router;
