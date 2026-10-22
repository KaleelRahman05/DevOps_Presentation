import express from 'express';
import { body } from 'express-validator';
import { login, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validate.js';

const router = express.Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidationErrors,
  login
);

router.get('/me', protect, getMe);
router.post('/logout', logout);

export default router;
