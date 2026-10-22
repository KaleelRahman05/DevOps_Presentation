import express from 'express';
import { body } from 'express-validator';
import {
  getMovies,
  getFeaturedMovies,
  getMovieById,
  getMovieRecommendationsHandler,
  createMovie,
  updateMovie,
  deleteMovie,
} from '../controllers/movieController.js';
import {
  getReviewsForMovie,
  createReview,
} from '../controllers/reviewController.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validate.js';

const router = express.Router();

// Public movie routes
router.get('/', getMovies);
router.get('/featured', getFeaturedMovies);
router.get('/:id', getMovieById);
router.get('/:id/recommendations', getMovieRecommendationsHandler);

// Admin-only movie routes
router.post(
  '/',
  protect,
  requireAdmin,
  [
    body('title').trim().notEmpty().withMessage('Movie title is required'),
    body('posterUrl').trim().isURL().withMessage('Valid poster URL is required'),
    body('releaseYear')
      .isInt({ min: 1888, max: 2100 })
      .withMessage('Release year must be between 1888 and 2100'),
    body('genres').notEmpty().withMessage('At least one genre is required'),
    body('synopsis')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Synopsis must be between 10 and 2000 characters'),
    body('runtime')
      .isInt({ min: 1 })
      .withMessage('Runtime must be at least 1 minute'),
    body('director').trim().notEmpty().withMessage('Director is required'),
    body('cast').notEmpty().withMessage('Cast is required'),
  ],
  handleValidationErrors,
  createMovie
);

router.put('/:id', protect, requireAdmin, updateMovie);
router.delete('/:id', protect, requireAdmin, deleteMovie);

// Nested review routes
router.get('/:id/reviews', getReviewsForMovie);

router.post(
  '/:id/reviews',
  [
    body('reviewerName')
      .trim()
      .isLength({ min: 2, max: 60 })
      .withMessage('Reviewer name must be between 2 and 60 characters'),
    body('rating')
      .isInt({ min: 1, max: 10 })
      .withMessage('Rating must be an integer between 1 and 10'),
    body('reviewTitle')
      .trim()
      .isLength({ min: 3, max: 120 })
      .withMessage('Review title must be between 3 and 120 characters'),
    body('reviewText')
      .trim()
      .isLength({ min: 10, max: 3000 })
      .withMessage('Review text must be between 10 and 3000 characters'),
  ],
  handleValidationErrors,
  createReview
);

export default router;
