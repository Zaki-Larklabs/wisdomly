import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export const createStudent = async (schoolId: string, data: any) => {
  // 1. Check for duplicate roll numbers within this specific school tenant space
  const existingRoll = await prisma.student.findFirst({
    where: { schoolId, rollNumber: data.rollNumber }
  });
  if (existingRoll) {
    throw new AppError(409, 'DUPLICATE_ERROR', `Roll number ${data.rollNumber} already exists in this school`);
  }

  // 2. Hash default student password entry
  const passwordHash = await bcrypt.hash(data.password, 12);

  // 3. Atomically create User login credentials and Student structural record
  return await prisma.$transaction(async (tx: any) => {
    const user = await tx.user.create({
      data: {
        schoolId,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: 'STUDENT',
      }
    });

    return await tx.student.create({
      data: {
        schoolId,
        userId: user.id,
        rollNumber: data.rollNumber,
        name: data.name,
        dob: data.dob,
        gender: data.gender,
        address: data.address,
        classId: data.classId,
        sectionId: data.sectionId,
        parentId: data.parentId,
      },
      include: { user: true }
    });
  });
};

export const getAllStudents = async (schoolId: string) => {
  return await prisma.student.findMany({
    where: { schoolId },
    include: { class: true, section: true }
  });
};

export const importStudentsBulk = async (schoolId: string, csvText: string) => {
  // 1. Parse the raw CSV text into rows and columns
  const lines = csvText.split('\n').map(line => line.trim()).filter(Boolean);
  const header = lines.shift()?.split(',');

  if (!header) {
    throw new AppError(400, 'VALIDATION_ERROR', 'CSV file is empty or missing headers');
  }

  const records: any[] = [];
  
  // 2. Map lines to JSON objects dynamically
  for (const line of lines) {
    const values = line.split(',');
    const record: any = {};
    header.forEach((key, index) => {
      record[key.trim()] = values[index]?.trim();
    });
    records.push(record);
  }

  // 3. Process records inside a safe database transaction block
  return await prisma.$transaction(async (tx: any) => {
    const createdStudents = [];

    for (const record of records) {
      // Validate unique roll numbers inside this batch
      const existingRoll = await tx.student.findFirst({
        where: { schoolId, rollNumber: record.rollNumber }
      });
      if (existingRoll) {
        throw new AppError(409, 'DUPLICATE_ERROR', `Bulk Import Stopped: Roll number ${record.rollNumber} already exists.`);
      }

      // Hash password (fallback to a default format if not provided in spreadsheet)
      const defaultPassword = record.password || 'Welcome@123';
      const passwordHash = await bcrypt.hash(defaultPassword, 12);

      // Create identity system login profile
      const user = await tx.user.create({
        data: {
          schoolId,
          email: record.email,
          phone: record.phone || null,
          passwordHash,
          role: 'STUDENT',
        }
      });

      // Construct student profile link
      const student = await tx.student.create({
        data: {
          schoolId,
          userId: user.id,
          rollNumber: record.rollNumber,
          name: record.name,
          gender: record.gender,
          dob: new Date(record.dob),
          address: record.address || null,
          classId: record.classId,
          sectionId: record.sectionId,
        }
      });

      createdStudents.push(student);
    }

    return { totalImported: createdStudents.length, students: createdStudents };
  });
};

export const getStudentProfileWorkspace = async (userId: string) => {
  // 1. Locate the core student index attached to this login credential identity
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      class: {
        include: {
          subjects: {
            include: {
              teacher: { select: { name: true, department: true } }
            }
          }
        }
      },
      section: true,
    },
  });

  if (!student) {
    throw new AppError(404, 'NOT_FOUND', 'Student database record registry not discovered');
  }

  return student;
};