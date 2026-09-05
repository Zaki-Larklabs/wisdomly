import { Request, Response } from 'express';
import * as libraryService from './library.service';
import { createBookSchema, updateBookSchema, borrowBookSchema } from './library.schema';
import { prisma } from '../../config/database';

export const createBook = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const data = createBookSchema.parse(req.body);
  const book = await libraryService.createBook(schoolId, data);
  res.status(201).json({ success: true, data: book, meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() } });
};

export const updateBook = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { id } = req.params;
  const data = updateBookSchema.parse(req.body);
  const book = await libraryService.updateBook(schoolId, id, data);
  res.status(200).json({ success: true, data: book, meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() } });
};

export const deleteBook = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { id } = req.params;
  await libraryService.deleteBook(schoolId, id);
  res.status(200).json({ success: true, data: { id }, meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() } });
};

export const getBooks = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const books = await libraryService.getBooks(schoolId, req.query as any);
  res.status(200).json({ success: true, data: books, meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() } });
};

export const getBookById = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { id } = req.params;
  const book = await libraryService.getBookById(schoolId, id);
  res.status(200).json({ success: true, data: book, meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() } });
};

export const borrowBook = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const data = borrowBookSchema.parse(req.body);
  const borrow = await libraryService.borrowBook(schoolId, data);
  res.status(201).json({ success: true, data: borrow, meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() } });
};

export const returnBook = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { id } = req.params;
  const borrow = await libraryService.returnBook(schoolId, id);
  res.status(200).json({ success: true, data: borrow, meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() } });
};

export const getBorrows = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const borrows = await libraryService.getBorrows(schoolId, req.query as any);
  res.status(200).json({ success: true, data: borrows, meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() } });
};

export const getMyBorrows = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user?.sub!;
  const role = req.user?.role!;
  const borrows = await libraryService.getMyBorrows(schoolId, userId, role);
  res.status(200).json({ success: true, data: borrows, meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() } });
};
