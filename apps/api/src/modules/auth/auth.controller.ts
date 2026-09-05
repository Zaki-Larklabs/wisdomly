import { Request, Response } from 'express';
import * as authService from './auth.service';
import { prisma } from '../../config/database';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, updateProfileSchema, registerStudentSchema, registerParentSchema } from './auth.schema';

export const login = async (req: Request, res: Response) => {
  // 1. Validate incoming body with Zod
  const input = loginSchema.parse(req.body);
  
  // 2. Call the service
  const { tokens, user } = await authService.login(input);

  // 3. Set secure cookie for refresh token
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // 4. Send access token to frontend
  res.status(200).json({ success: true, data: { accessToken: tokens.accessToken, user } });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ success: false, error: { code: 'NO_TOKEN', message: 'No refresh token provided' } });
  }

  const tokens = await authService.refresh(refreshToken);

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.status(200).json({ success: true, data: { accessToken: tokens.accessToken } });
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, data: { message: 'Logged out successfully' } });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const input = forgotPasswordSchema.parse(req.body);
  const result = await authService.forgotPassword(input);
  res.status(200).json({ success: true, data: result });
};

export const resetPassword = async (req: Request, res: Response) => {
  const input = resetPasswordSchema.parse(req.body);
  const result = await authService.resetPassword(input);
  res.status(200).json({ success: true, data: result });
};

export const changePassword = async (req: Request, res: Response) => {
  const input = changePasswordSchema.parse(req.body);
  const result = await authService.changePassword(req.user!.sub, input);
  res.status(200).json({ success: true, data: result });
};

export const getProfile = async (req: Request, res: Response) => {
  const result = await authService.getProfile(req.user!.sub);
  res.status(200).json({ success: true, data: result });
};

export const updateProfile = async (req: Request, res: Response) => {
  const input = updateProfileSchema.parse(req.body);
  const result = await authService.updateProfile(req.user!.sub, input);
  res.status(200).json({ success: true, data: result });
};

// ─── Registration ───────────────────────────────────────────

export const registerStudent = async (req: Request, res: Response) => {
  const input = registerStudentSchema.parse(req.body);
  const result = await authService.registerStudent(input);
  res.status(201).json({ success: true, data: { user: result, message: 'Registration submitted for approval' } });
};

export const registerParent = async (req: Request, res: Response) => {
  const input = registerParentSchema.parse(req.body);
  const result = await authService.registerParent(input);
  res.status(201).json({ success: true, data: { user: result, message: 'Registration submitted for approval' } });
};

export const getSchoolBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const school = await prisma.school.findUnique({
    where: { slug },
    include: {
      classes: { include: { sections: true } },
    }
  });
  if (!school || !school.isActive) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'School not found' } });
  }
  res.status(200).json({ success: true, data: school });
};