import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export const getMyChildren = async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const schoolId = req.schoolId!;

  const parent = await prisma.parent.findFirst({
    where: { schoolId, userId },
    include: {
      children: {
        include: {
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!parent) {
    return res.status(200).json({ success: true, data: [] });
  }

  res.status(200).json({ success: true, data: parent.children });
};
