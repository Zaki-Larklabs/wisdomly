import { Router } from 'express';
import {
  submitMarks,
  generateReportCards,
  getStudentResults,
  getStudentMarksForExam,
  getMyResults,
  getMyMarksForExam,
} from './marks.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Student self-service
router.get('/my-results', rbac(['STUDENT']), asyncHandler(getMyResults));
router.get('/my-marks/:examId', rbac(['STUDENT']), asyncHandler(getMyMarksForExam));

// Admin / Teacher endpoints
router.post('/bulk', rbac(['ADMIN', 'TEACHER']), asyncHandler(submitMarks));
router.post('/report-cards/generate', rbac(['ADMIN']), asyncHandler(generateReportCards));

// Read endpoints
router.get('/student/:studentId', rbac(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']), asyncHandler(getStudentResults));
router.get('/student/:studentId/exam/:examId', rbac(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']), asyncHandler(getStudentMarksForExam));

export default router;
