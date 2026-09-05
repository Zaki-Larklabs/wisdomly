import { Request, Response } from 'express';
import * as documentsService from './documents.service';
import { createDocumentSchema } from './documents.schema';
import { prisma } from '../../config/database';

export const create = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user!.sub;
  const input = createDocumentSchema.parse(req.body);

  const teacher = await prisma.teacher.findFirst({ where: { schoolId, userId } });
  if (!teacher) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only teachers can upload documents' } });

  const doc = await documentsService.createDocument(schoolId, teacher.id, input);
  res.status(201).json({ success: true, data: doc });
};

export const list = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { classId } = req.query;
  const docs = await documentsService.listDocuments(schoolId, classId as string | undefined);
  res.status(200).json({ success: true, data: docs });
};

export const remove = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { documentId } = req.params;
  await documentsService.deleteDocument(schoolId, documentId);
  res.status(200).json({ success: true, data: { message: 'Document deleted' } });
};
