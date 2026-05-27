import { Request, Response } from 'express';
import * as authService from './auth.service';
import { loginSchema } from './auth.schema';

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