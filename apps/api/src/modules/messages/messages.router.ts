import { Router } from 'express';
import { send, listConversations, getConversation } from './messages.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.post('/', asyncHandler(send));
router.get('/conversations', asyncHandler(listConversations));
router.get('/conversations/:otherUserId', asyncHandler(getConversation));

export default router;
