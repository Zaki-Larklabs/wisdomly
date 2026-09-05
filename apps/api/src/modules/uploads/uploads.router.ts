import { Router, Request, Response } from 'express';
import { upload } from '../../middleware/upload';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.post('/file', rbac(['ADMIN', 'TEACHER', 'STUDENT']), upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } });
  }
  const url = `/uploads/${req.file.filename}`;
  res.status(200).json({
    success: true,
    data: {
      url,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
    meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() }
  });
});

export default router;
