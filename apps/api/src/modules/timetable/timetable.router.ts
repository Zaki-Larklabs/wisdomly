import { Router } from 'express';
import {
  createTimetable,
  updateTimetable,
  deleteTimetable,
  getTimetableByClassId,
  getTimetableBySectionId,
  getTimetableByTeacherId,
  getMyTimetable
} from './timetable.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Create, Update, Delete: ADMIN only
router.post('/', rbac(['ADMIN']), asyncHandler(createTimetable));
router.put('/:id', rbac(['ADMIN']), asyncHandler(updateTimetable));
router.delete('/:id', rbac(['ADMIN']), asyncHandler(deleteTimetable));

// Read endpoints
router.get('/class/:classId', rbac(['ADMIN']), asyncHandler(getTimetableByClassId));
router.get('/section/:sectionId', rbac(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']), asyncHandler(getTimetableBySectionId));
router.get('/teacher/:teacherId', rbac(['ADMIN', 'TEACHER']), asyncHandler(getTimetableByTeacherId));
router.get('/me', rbac(['TEACHER', 'STUDENT']), asyncHandler(getMyTimetable));

export default router;
