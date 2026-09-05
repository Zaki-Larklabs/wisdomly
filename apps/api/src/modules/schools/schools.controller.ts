import { Request, Response } from 'express';
import * as schoolsService from './schools.service';
import { updateSchoolSchema } from './schools.schema';

export const getProfile = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const school = await schoolsService.getSchoolProfile(schoolId);
  res.status(200).json({ success: true, data: school });
};

export const updateProfile = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const input = updateSchoolSchema.parse(req.body);
  const school = await schoolsService.updateSchoolProfile(schoolId, input);
  res.status(200).json({ success: true, data: school });
};
