import { Router } from 'express';
import { login, refresh, logout } from './auth.controller';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refresh));
router.post('/logout', asyncHandler(logout));

export default router;