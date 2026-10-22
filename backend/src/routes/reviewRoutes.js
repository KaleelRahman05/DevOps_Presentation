import express from 'express';
import { deleteReview } from '../controllers/reviewController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Delete review (authorized admin or authenticated user)
router.delete('/:id', protect, requireAdmin, deleteReview);

export default router;
