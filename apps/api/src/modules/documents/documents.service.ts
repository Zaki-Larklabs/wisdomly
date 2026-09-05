import { prisma } from '../../config/database';
import { CreateDocumentInput } from './documents.schema';

export const createDocument = async (schoolId: string, teacherId: string, input: CreateDocumentInput) => {
  return await prisma.document.create({
    data: { schoolId, uploaderId: teacherId, ...input },
    include: { uploadedBy: { select: { name: true } } },
  });
};

export const listDocuments = async (schoolId: string, classId?: string) => {
  const where: Record<string, unknown> = { schoolId };
  if (classId) where.classId = classId;

  return await prisma.document.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { uploadedBy: { select: { name: true } } },
  });
};

export const deleteDocument = async (schoolId: string, documentId: string) => {
  await prisma.document.delete({ where: { id: documentId, schoolId } });
};
