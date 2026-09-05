import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Role } from '@prisma/client';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { LoginInput, ForgotPasswordInput, ResetPasswordInput, ChangePasswordInput, UpdateProfileInput, RegisterStudentInput, RegisterParentInput } from './auth.schema';

const resolveSchool = async (slug: string) => {
  const school = await prisma.school.findUnique({ where: { slug } });
  if (!school || !school.isActive) {
    throw new AppError(404, 'NOT_FOUND', 'School not found or inactive');
  }
  return school;
};

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
    await redis.set(`revoked:${token}`, '1', { ex: 604800 });
  } catch (err) {
    // Fail silently
  }
};

// ─── Password Management ─────────────────────────────────────

// ─── Registration ──────────────────────────────────────────

export const registerStudent = async (input: RegisterStudentInput) => {
  const school = await resolveSchool(input.schoolSlug);

  // Check duplicate email within school
  if (input.email) {
    const existing = await prisma.user.findFirst({
      where: { schoolId: school.id, email: input.email }
    });
    if (existing) throw new AppError(409, 'DUPLICATE_ERROR', 'Email already registered in this school');
  }

  // Check duplicate roll number
  const existingRoll = await prisma.student.findFirst({
    where: { schoolId: school.id, rollNumber: input.rollNumber }
  });
  if (existingRoll) throw new AppError(409, 'DUPLICATE_ERROR', 'Roll number already exists in this school');

  // Auto-link to parent if parentPhone matches an existing parent
  let parentId: string | null = null;
  if (input.parentPhone) {
    const parentUser = await prisma.user.findFirst({
      where: { schoolId: school.id, phone: input.parentPhone, role: 'PARENT' },
      include: { parent: true }
    });
    if (parentUser?.parent) parentId = parentUser.parent.id;
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  return await prisma.$transaction(async (tx: any) => {
    const user = await tx.user.create({
      data: {
        schoolId: school.id,
        email: input.email,
        phone: input.phone || null,
        passwordHash,
        role: 'STUDENT',
        isActive: false,
      }
    });

    const student = await tx.student.create({
      data: {
        schoolId: school.id,
        userId: user.id,
        rollNumber: input.rollNumber,
        name: input.name,
        dob: input.dob ? new Date(input.dob) : undefined,
        gender: input.gender || undefined,
        address: input.address || null,
        classId: input.classId,
        sectionId: input.sectionId,
        parentId,
      }
    });

    return { id: user.id, email: user.email, role: user.role, name: student.name, rollNumber: student.rollNumber };
  });
};

export const registerParent = async (input: RegisterParentInput) => {
  const school = await resolveSchool(input.schoolSlug);

  if (input.email) {
    const existing = await prisma.user.findFirst({
      where: { schoolId: school.id, email: input.email }
    });
    if (existing) throw new AppError(409, 'DUPLICATE_ERROR', 'Email already registered in this school');
  }

  if (input.phone) {
    const existing = await prisma.user.findFirst({
      where: { schoolId: school.id, phone: input.phone }
    });
    if (existing) throw new AppError(409, 'DUPLICATE_ERROR', 'Phone already registered in this school');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  return await prisma.$transaction(async (tx: any) => {
    const user = await tx.user.create({
      data: {
        schoolId: school.id,
        email: input.email,
        phone: input.phone || null,
        passwordHash,
        role: 'PARENT',
        isActive: false,
      }
    });

    const parent = await tx.parent.create({
      data: {
        schoolId: school.id,
        userId: user.id,
        name: input.name,
        phone: input.phone || null,
        email: input.email || null,
      }
    });

    // Link to students by roll numbers if provided
    if (input.studentRollNumbers && input.studentRollNumbers.length > 0) {
      await tx.student.updateMany({
        where: { schoolId: school.id, rollNumber: { in: input.studentRollNumbers } },
        data: { parentId: parent.id }
      });
    }

    return { id: user.id, email: user.email, role: user.role, name: parent.name };
  });
};

// ─── Password Management ─────────────────────────────────────

export const forgotPassword = async (input: ForgotPasswordInput) => {
  const { identifier, role, schoolSlug } = input;
  let schoolId: string | null = null;

  if (role !== Role.SUPER_ADMIN && schoolSlug) {
    const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
    if (!school) throw new AppError(404, 'NOT_FOUND', 'School not found');
    schoolId = school.id;
  }

  const where: any = { role };
  if (schoolId) where.schoolId = schoolId;
  where.OR = [{ email: identifier }, { phone: identifier }];

  const user = await prisma.user.findFirst({ where });
  if (!user) {
    return { message: 'If an account exists, a reset link has been sent' };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = Date.now() + 3600000; // 1 hour

  await redis.set(`reset:${resetToken}`, JSON.stringify({ userId: user.id, expiresAt: resetExpires }), { ex: 3600 });

  return { message: 'If an account exists, a reset link has been sent', resetToken };
};

export const resetPassword = async (input: ResetPasswordInput) => {
  const data = await redis.get(`reset:${input.token}`);
  if (!data) throw new AppError(400, 'INVALID_TOKEN', 'Invalid or expired reset token');

  const { userId, expiresAt } = JSON.parse(data);
  if (Date.now() > expiresAt) {
    await redis.del(`reset:${input.token}`);
    throw new AppError(400, 'EXPIRED_TOKEN', 'Reset token has expired');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  await redis.del(`reset:${input.token}`);

  return { message: 'Password has been reset successfully' };
};

export const changePassword = async (userId: string, input: ChangePasswordInput) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');

  const isPasswordValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!isPasswordValid) throw new AppError(400, 'INVALID_PASSWORD', 'Current password is incorrect');

  const passwordHash = await bcrypt.hash(input.newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return { message: 'Password changed successfully' };
};

// ─── Profile ─────────────────────────────────────────────────

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, phone: true, role: true, schoolId: true, createdAt: true, lastLoginAt: true, student: { select: { name: true, rollNumber: true, class: { select: { name: true } } } }, teacher: { select: { name: true, employeeId: true } }, parent: { select: { name: true } } },
  });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
  return user;
};

export const updateProfile = async (userId: string, input: UpdateProfileInput) => {
  const updateData: Record<string, string> = {};
  if (input.email) updateData.email = input.email;
  if (input.phone) updateData.phone = input.phone;

  if (Object.keys(updateData).length === 0) throw new AppError(400, 'NO_DATA', 'Nothing to update');

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, email: true, phone: true, role: true },
  });
  return user;
};