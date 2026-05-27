import { prisma } from '../../config/database';

export const getSchoolMetrics = async (schoolId: string) => {
  // Query count records concurrently across isolation boundaries
  const [studentCount, teacherCount, classCount] = await Promise.all([
    prisma.student.count({ where: { schoolId } }),
    prisma.teacher.count({ where: { schoolId } }),
    prisma.class.count({ where: { schoolId } }),
  ]);

  return {
    totalStudents: studentCount,
    totalTeachers: teacherCount,
    totalClasses: classCount,
    systemStatus: 'OPERATIONAL',
  };
};