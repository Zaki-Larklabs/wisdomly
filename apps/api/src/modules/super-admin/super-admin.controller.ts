import { Request, Response } from 'express';
import * as superAdminService from './super-admin.service';
import { createSchoolSchema } from './super-admin.schema';

export const getStats = async (req: Request, res: Response) => {
  const stats = await superAdminService.getPlatformStats();
  res.status(200).json({ success: true, data: stats });
};

export const listSchools = async (req: Request, res: Response) => {
  const schools = await superAdminService.listSchools();
  res.status(200).json({ success: true, data: schools });
};

export const createSchool = async (req: Request, res: Response) => {
  const input = createSchoolSchema.parse(req.body);
  const school = await superAdminService.createSchool(input);
  res.status(201).json({ success: true, data: school });
};

export const toggleSchool = async (req: Request, res: Response) => {
  const { schoolId } = req.params;
  const school = await superAdminService.toggleSchoolStatus(schoolId);
  res.status(200).json({ success: true, data: school });
};
