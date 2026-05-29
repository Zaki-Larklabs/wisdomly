import { prisma } from '../../config/database';

export const createBroadcast = async (schoolId: string, authorId: string, data: any) => {
  return await prisma.notice.create({
    data: {
      schoolId,
      authorId,
      title: data.title,
      content: data.content,
      targetRole: data.targetRole,
    },
  });
};

export const getTargetedNotices = async (schoolId: string, userRole: string) => {
  // Admins see everything. Other roles see 'ALL' plus their specific role.
  const roleFilter = ['ADMIN', 'SUPER_ADMIN'].includes(userRole) 
    ? {} 
    : { targetRole: { in: ['ALL', userRole] } };

  return await prisma.notice.findMany({
    where: { 
      schoolId, 
      ...roleFilter 
    },
    orderBy: { createdAt: 'desc' },
    take: 20, // Limit payload to the 20 most recent broadcasts
  });
};