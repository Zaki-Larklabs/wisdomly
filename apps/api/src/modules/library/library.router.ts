import { Router } from 'express';
import {
  createBook, updateBook, deleteBook, getBooks, getBookById,
  borrowBook, returnBook, getBorrows, getMyBorrows
} from './library.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.post('/books', rbac(['ADMIN']), asyncHandler(createBook));
router.put('/books/:id', rbac(['ADMIN']), asyncHandler(updateBook));
router.delete('/books/:id', rbac(['ADMIN']), asyncHandler(deleteBook));
router.get('/books', rbac(['ADMIN', 'TEACHER', 'STUDENT']), asyncHandler(getBooks));
router.get('/books/:id', rbac(['ADMIN', 'TEACHER', 'STUDENT']), asyncHandler(getBookById));

router.post('/borrow', rbac(['ADMIN']), asyncHandler(borrowBook));
router.put('/return/:id', rbac(['ADMIN']), asyncHandler(returnBook));
router.get('/borrows', rbac(['ADMIN']), asyncHandler(getBorrows));
router.get('/my-borrows', rbac(['TEACHER', 'STUDENT']), asyncHandler(getMyBorrows));

export default router;
