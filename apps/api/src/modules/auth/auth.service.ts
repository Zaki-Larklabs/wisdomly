import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { LoginInput } from './auth.schema';

const generateTokens = (userId: string, role: Role, schoolId: string | null) => {
  const payload = { sub: userId, role, schoolId };
  
  const accessToken = jwt.sign(payload, env.JWT_SECRET, { 
    expiresIn: env.JWT_EXPIRES_IN as any
  });
  
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { 
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any
  });

  return { accessToken, refreshToken };
};

export const login = async (input: LoginInput) => {
  const { identifier, password, role, schoolSlug } = input;
  let schoolId: string | null = null;

  // 1. Validate school tenant scope unless the role is SUPER_ADMIN
  if (role !== Role.SUPER_ADMIN) {
    if (!schoolSlug) {
      throw new AppError(400, 'VALIDATION_ERROR', 'School identifier is required for this scope');
    }
    const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
    if (!school || !school.isActive) {
      throw new AppError(404, 'NOT_FOUND', 'School tenant space not found or disabled');
    }
    schoolId = school.id;
  }

  // 2. Resolve authentication strategies depending on target role
  let user = null;

  if (role === Role.SUPER_ADMIN) {
    user = await prisma.user.findFirst({
      where: { email: identifier, role: Role.SUPER_ADMIN }
    });
  } else if (role === Role.STUDENT) {
    // Students authenticate locally via Roll Numbers or email/phone scoped inside their school space
    const studentRecord = await prisma.student.findUnique({
      where: { 
        schoolId_rollNumber: { schoolId: schoolId!, rollNumber: identifier } 
      },
      include: { user: true }
    });
    if (studentRecord && studentRecord.user.role === Role.STUDENT) {
      user = studentRecord.user;
    } else {
      user = await prisma.user.findFirst({
        where: {
          schoolId,
          role: Role.STUDENT,
          OR: [
            { email: identifier },
            { phone: identifier }
          ]
        }
      });
    }
  } else {
    // ADMIN, TEACHER, and PARENT scopes search matches across either email or phone numbers
    user = await prisma.user.findFirst({
      where: {
        schoolId,
        role,
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      }
    });
  }

  if (!user || !user.isActive) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid identifier, credential context, or disabled account status');
  }

  // 3. Confirm cryptographic password matches hash
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid identifier or password entry');
  }

  // 4. Record access state timestamp
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  // 5. Allocate secure access mapping tokens
  const tokens = generateTokens(user.id, user.role, user.schoolId);

  return {
    tokens,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      schoolId: user.schoolId
    }
  };
};

export const refresh = async (token: string) => {
  try {
    // Audit blacklisted state inside Redis store cache layer
    const isRevoked = await redis.get(`revoked:${token}`);
    if (isRevoked) {
      throw new AppError(401, 'UNAUTHORIZED', 'Session token has already been signed out');
    }

    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as any;
    
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user || !user.isActive) {
      throw new AppError(401, 'UNAUTHORIZED', 'Account state target no longer available');
    }

    return generateTokens(user.id, user.role, user.schoolId);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(401, 'INVALID_TOKEN', 'Session token parsing or expiration failure');
  }
};

export const logout = async (token: string) => {
  try {
    // Blacklist token signature parameters inside Redis cache space for 7 days
    await redis.set(`revoked:${token}`, '1', { ex: 604800 });
  } catch (err) {
    // Fail silently to keep application performance fluid
  }
};