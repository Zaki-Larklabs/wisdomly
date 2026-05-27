import { Request, Response } from 'express';
import * as classesService from './classes.service';
import { createClassSchema, createSectionSchema } from './classes.schema';


export const addClass = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const validatedInput = createClassSchema.parse(req.body);

  const newClass = await classesService.createNewClass(schoolId, validatedInput);

  res.status(201).json({
    success: true,
    data: newClass
  });
};

export const listClasses = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const classes = await classesService.getClassesWithSections(schoolId);

  res.status(200).json({
    success: true,
    data: classes
  });
};
export const addSection = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const validatedInput = createSectionSchema.parse(req.body);

  const newSection = await classesService.createNewSection(schoolId, validatedInput);

  res.status(201).json({
    success: true,
    data: newSection
  });
};