import { Request, Response, NextFunction } from 'express';

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Auth required before tenant check' } });
  }

  if (req.user.role === 'SUPER_ADMIN') {
    req.schoolId = req.user.schoolId || null;
    return next();
  }

  if (!req.user.schoolId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'School context required for this role' } });
  }

  req.schoolId = req.user.schoolId;
  next();
};