import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export const createBook = async (schoolId: string, data: any) => {
  const existing = await prisma.book.findUnique({
    where: { schoolId_isbn: { schoolId, isbn: data.isbn || '' } }
  });
  if (existing && data.isbn) throw new AppError(409, 'BOOK_EXISTS', 'A book with this ISBN already exists');

  return await prisma.book.create({
    data: { ...data, availableCount: data.quantity, schoolId }
  });
};

export const updateBook = async (schoolId: string, id: string, data: any) => {
  const book = await prisma.book.findFirst({ where: { id, schoolId } });
  if (!book) throw new AppError(404, 'NOT_FOUND', 'Book not found');

  const updateData: any = { ...data };
  if (data.quantity !== undefined) {
    const borrowed = await prisma.bookBorrow.count({
      where: { bookId: id, schoolId, status: 'BORROWED' }
    });
    updateData.availableCount = data.quantity - borrowed;
  }

  return await prisma.book.update({ where: { id }, data: updateData });
};

export const deleteBook = async (schoolId: string, id: string) => {
  const book = await prisma.book.findFirst({ where: { id, schoolId } });
  if (!book) throw new AppError(404, 'NOT_FOUND', 'Book not found');

  const activeBorrows = await prisma.bookBorrow.count({
    where: { bookId: id, schoolId, status: 'BORROWED' }
  });
  if (activeBorrows > 0) throw new AppError(409, 'HAS_BORROWS', 'Cannot delete book with active borrows');

  await prisma.book.delete({ where: { id } });
  return true;
};

export const getBooks = async (schoolId: string, query: { search?: string; category?: string; status?: string }) => {
  const where: any = { schoolId };
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { author: { contains: query.search, mode: 'insensitive' } },
      { isbn: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.category) where.category = query.category;
  if (query.status) where.status = query.status;

  return await prisma.book.findMany({
    where,
    orderBy: { title: 'asc' },
    include: { _count: { select: { borrows: { where: { status: 'BORROWED' } } } } }
  });
};

export const getBookById = async (schoolId: string, id: string) => {
  const book = await prisma.book.findFirst({
    where: { id, schoolId },
    include: {
      borrows: {
        where: { status: 'BORROWED' },
        orderBy: { borrowDate: 'desc' },
        take: 20
      }
    }
  });
  if (!book) throw new AppError(404, 'NOT_FOUND', 'Book not found');
  return book;
};

export const borrowBook = async (schoolId: string, data: { bookId: string; borrowerId: string; borrowerRole: string; dueDate: string }) => {
  const book = await prisma.book.findFirst({ where: { id: data.bookId, schoolId } });
  if (!book) throw new AppError(404, 'NOT_FOUND', 'Book not found');
  if (book.availableCount < 1) throw new AppError(409, 'NO_COPIES', 'No copies available');

  const existing = await prisma.bookBorrow.findFirst({
    where: { bookId: data.bookId, borrowerId: data.borrowerId, status: 'BORROWED' }
  });
  if (existing) throw new AppError(409, 'ALREADY_BORROWED', 'Already borrowed a copy of this book');

  const borrow = await prisma.bookBorrow.create({
    data: {
      schoolId,
      bookId: data.bookId,
      borrowerId: data.borrowerId,
      borrowerRole: data.borrowerRole,
      dueDate: new Date(data.dueDate),
    }
  });

  await prisma.book.update({
    where: { id: data.bookId },
    data: { availableCount: { decrement: 1 }, status: 'BORROWED' }
  });

  return borrow;
};

export const returnBook = async (schoolId: string, borrowId: string) => {
  const borrow = await prisma.bookBorrow.findFirst({
    where: { id: borrowId, schoolId, status: 'BORROWED' }
  });
  if (!borrow) throw new AppError(404, 'NOT_FOUND', 'Active borrow record not found');

  const updated = await prisma.bookBorrow.update({
    where: { id: borrowId },
    data: { status: 'RETURNED', returnedDate: new Date() }
  });

  const remainingBorrows = await prisma.bookBorrow.count({
    where: { bookId: borrow.bookId, schoolId, status: 'BORROWED' }
  });

  await prisma.book.update({
    where: { id: borrow.bookId },
    data: {
      availableCount: { increment: 1 },
      status: remainingBorrows === 0 ? 'AVAILABLE' : undefined
    }
  });

  return updated;
};

export const getBorrows = async (schoolId: string, query: { status?: string; borrowerId?: string }) => {
  const where: any = { schoolId };
  if (query.status) where.status = query.status;
  if (query.borrowerId) where.borrowerId = query.borrowerId;

  return await prisma.bookBorrow.findMany({
    where,
    include: { book: true },
    orderBy: { borrowDate: 'desc' },
    take: 50
  });
};

export const getMyBorrows = async (schoolId: string, userId: string, role: string) => {
  let borrowerId = userId;
  if (role === 'STUDENT') {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (student) borrowerId = student.id;
  } else if (role === 'TEACHER') {
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (teacher) borrowerId = teacher.id;
  }

  return await prisma.bookBorrow.findMany({
    where: { schoolId, borrowerId },
    include: { book: true },
    orderBy: { borrowDate: 'desc' }
  });
};
