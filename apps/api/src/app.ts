import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { asyncHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRouter from './modules/auth/auth.router';
import studentsRouter from './modules/students/students.router'; // 1. Import the students router
import teachersRouter from './modules/teachers/teachers.router';
import adminRouter from './modules/admin/admin.router';
import classesRouter from './modules/classes/classes.router';
import subjectsRouter from './modules/subjects/subjects.router';
import timetableRouter from './modules/timetable/timetable.router';
import attendanceRouter from './modules/attendance/attendance.router';
import marksRouter from './modules/marks/marks.router';
import homeworkRouter from './modules/homework/homework.router';
import noticesRouter from './modules/notices/notices.router';
import feesRouter from './modules/fees/fees.router';
import notificationsRouter from './modules/notifications/notifications.router';
import examsRouter from './modules/exams/exams.router';
import schoolsRouter from './modules/schools/schools.router';
import superAdminRouter from './modules/super-admin/super-admin.router';
import parentsRouter from './modules/parents/parents.router';
import leavesRouter from './modules/leaves/leaves.router';
import messagesRouter from './modules/messages/messages.router';
import documentsRouter from './modules/documents/documents.router';
import progressRouter from './modules/progress/progress.router';
import libraryRouter from './modules/library/library.router';
import staffRouter from './modules/staff/staff.router';
import paymentsRouter from './modules/payments/payments.router';
import analyticsRouter from './modules/analytics/analytics.router';
import uploadsRouter from './modules/uploads/uploads.router';
import { handleStripeWebhook } from './modules/payments/payments.controller';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS.split(','), credentials: true }));

// Stripe webhook needs raw body - placed before JSON parser
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || crypto.randomUUID();
  next();
});

// ─── Health Check ─────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', env: env.NODE_ENV, timestamp: new Date().toISOString() });
});

// ─── API Docs ────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customCss: '.swagger-ui .topbar { display: none }' }));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

// ─── Serve Uploads ───────────────────────────
app.use('/uploads', express.static('uploads'));

// ─── Application Modules ──────────────────────
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/students', studentsRouter); 
app.use('/api/v1/teachers', teachersRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/classes', classesRouter);
app.use('/api/v1/subjects', subjectsRouter);
app.use('/api/v1/timetable', timetableRouter);
app.use('/api/v1/attendance', attendanceRouter);
app.use('/api/v1/marks', marksRouter);
app.use('/api/v1/homework', homeworkRouter);
app.use('/api/v1/notices', noticesRouter);
app.use('/api/v1/fees', feesRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/exams', examsRouter);
app.use('/api/v1/schools', schoolsRouter);
app.use('/api/v1/super-admin', superAdminRouter);
app.use('/api/v1/parents', parentsRouter);
app.use('/api/v1/leaves', leavesRouter);
app.use('/api/v1/messages', messagesRouter);
app.use('/api/v1/documents', documentsRouter);
app.use('/api/v1/progress', progressRouter);
app.use('/api/v1/library', libraryRouter);
app.use('/api/v1/staff', staffRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/uploads', uploadsRouter);

// ─── 404 Handler ──────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// ─── Global Error Middleware ──────────────────
app.use(errorHandler);

export default app;