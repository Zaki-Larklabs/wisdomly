import { Router } from 'express';
import {
  markAttendance,
  getAttendanceByClass,
  getStudentAttendance
} from './attendance.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Mark bulk attendance: ADMIN or TEACHER
router.post('/bulk', rbac(['ADMIN', 'TEACHER']), asyncHandler(markAttendance));

// Read endpoints
router.get('/class/:classId', rbac(['ADMIN', 'TEACHER']), asyncHandler(getAttendanceByClass));
router.get('/student/:studentId', rbac(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']), asyncHandler(getStudentAttendance));

export default router;
