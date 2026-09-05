import { Router } from 'express';
import { login, refresh, logout, forgotPassword, resetPassword, changePassword, getProfile, updateProfile, registerStudent, registerParent, getSchoolBySlug } from './auth.controller';
import { asyncHandler } from '../../middleware/errorHandler';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refresh));
router.post('/logout', asyncHandler(logout));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));

// Registration (public)
router.post('/register/student', asyncHandler(registerStudent));
router.post('/register/parent', asyncHandler(registerParent));

// School lookup (public — for registration forms)
router.get('/school/:slug', asyncHandler(getSchoolBySlug));

// Protected routes
router.get('/profile', authMiddleware, asyncHandler(getProfile));
router.patch('/profile', authMiddleware, asyncHandler(updateProfile));
router.post('/change-password', authMiddleware, asyncHandler(changePassword));

export default router;