import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './modules/auth/auth.router';
import studentsRouter from './modules/students/students.router'; // 1. Import the students router
import teachersRouter from './modules/teachers/teachers.router';
import adminRouter from './modules/admin/admin.router';
import classesRouter from './modules/classes/classes.router';
import subjectsRouter from './modules/subjects/subjects.router';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS.split(','), credentials: true }));
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

// ─── Application Modules ──────────────────────
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/students', studentsRouter); 
app.use('/api/v1/teachers', teachersRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/classes', classesRouter);
app.use('/api/v1/subjects', subjectsRouter);

// ─── 404 Handler ──────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// ─── Global Error Middleware ──────────────────
app.use(errorHandler);

export default app;