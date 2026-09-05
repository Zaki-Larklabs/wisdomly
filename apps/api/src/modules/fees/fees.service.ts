import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { CreateFeeInput, BulkCreateFeeInput, PayFeeInput, LateFeeConfig, InstallmentPlanInput, WaiverInput, UpdateFeeInput, BulkDeleteInput, CreateFeeTemplateInput, ApplyFeeTemplateInput } from './fees.schema';

function generateReceiptNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RCP-${timestamp}-${random}`;
}

function extractLateFee(remarks: string | null): number {
  if (!remarks) return 0;
  try {
    const parsed = JSON.parse(remarks);
    return parsed.lateFee || 0;
  } catch {
    return 0;
  }
}

function getEffectiveAmount(amount: number, remarks: string | null): number {
  return amount + extractLateFee(remarks);
}

function getDiscountAmount(remarks: string | null): number {
  if (!remarks) return 0;
  try {
    const parsed = JSON.parse(remarks);
    return parsed.discount || 0;
  } catch {
    return 0;
  }
}

function buildRemarks(remarks: string | null | undefined, extra: Record<string, unknown> = {}): string {
  let base: Record<string, unknown> = {};
  if (remarks) {
    try { base = JSON.parse(remarks); } catch { base = { note: remarks }; }
  }
  return JSON.stringify({ ...base, ...extra });
}

// ─── Create Single Fee ──────────────────────────────────────
export const createFeeRecord = async (schoolId: string, data: CreateFeeInput) => {
  const student = await prisma.student.findFirst({
    where: { id: data.studentId, schoolId },
  });
  if (!student) throw new AppError(404, 'NOT_FOUND', 'Student not found in this school');

  const discount = data.discount || 0;
  const netAmount = data.amount - discount;
  const remarks = buildRemarks(data.remarks, {
    discount,
    discountReason: data.discountReason || (discount > 0 ? 'General discount' : undefined),
  });

  return await prisma.fee.create({
    data: {
      schoolId,
      studentId: data.studentId,
      feeType: data.feeType,
      amount: netAmount,
      dueDate: new Date(data.dueDate),
      status: 'PENDING',
      remarks,
    },
    include: {
      student: {
        select: { id: true, name: true, rollNumber: true, class: { select: { name: true } }, section: { select: { name: true } } },
      },
    },
  });
};

// ─── Bulk Create ────────────────────────────────────────────
export const bulkCreateFees = async (schoolId: string, data: BulkCreateFeeInput) => {
  const classEntity = await prisma.class.findFirst({
    where: { id: data.classId, schoolId },
  });
  if (!classEntity) throw new AppError(404, 'NOT_FOUND', 'Class not found');

  const whereStudents: any = { schoolId, classId: data.classId, isActive: true };
  if (data.sectionId) whereStudents.sectionId = data.sectionId;

  const students = await prisma.student.findMany({ where: whereStudents });
  if (students.length === 0) throw new AppError(400, 'NO_STUDENTS', 'No active students found in this class/section');

  const discount = data.discount || 0;
  const netAmount = data.amount - discount;
  const baseRemarks = buildRemarks(data.remarks, {
    discount,
    discountReason: data.discountReason || (discount > 0 ? 'Bulk discount' : undefined),
    bulkCreated: true,
    classId: data.classId,
    sectionId: data.sectionId || null,
  });

  const existing = await prisma.fee.findMany({
    where: {
      schoolId,
      studentId: { in: students.map(s => s.id) },
      feeType: data.feeType,
      dueDate: new Date(data.dueDate),
    },
  });
  const existingStudentIds = new Set(existing.map(f => f.studentId));
  const newStudents = students.filter(s => !existingStudentIds.has(s.id));

  if (newStudents.length === 0) {
    throw new AppError(400, 'DUPLICATE_FEES', 'All students already have this fee record');
  }

  const created = await prisma.fee.createManyAndReturn({
    data: newStudents.map(s => ({
      schoolId,
      studentId: s.id,
      feeType: data.feeType,
      amount: netAmount,
      dueDate: new Date(data.dueDate),
      status: 'PENDING' as const,
      remarks: baseRemarks,
    })),
    include: {
      student: {
        select: { id: true, name: true, rollNumber: true, class: { select: { name: true } }, section: { select: { name: true } } },
      },
    },
  });

  return {
    created: created.length,
    skipped: students.length - created.length,
    total: students.length,
    fees: created,
  };
};

// ─── List / Query ───────────────────────────────────────────
export const getFees = async (schoolId: string, role: string, userId: string) => {
  const where: any = { schoolId };

  if (role === 'STUDENT') {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) throw new AppError(404, 'NOT_FOUND', 'Student profile not found');
    where.studentId = student.id;
  }

  if (role === 'PARENT') {
    const parent = await prisma.parent.findUnique({
      where: { userId },
      include: { children: { select: { id: true } } },
    });
    if (!parent) throw new AppError(404, 'NOT_FOUND', 'Parent profile not found');
    where.studentId = { in: parent.children.map(c => c.id) };
  }

  const fees = await prisma.fee.findMany({
    where,
    include: {
      student: {
        select: { id: true, name: true, rollNumber: true, class: { select: { name: true } }, section: { select: { name: true } } },
      },
    },
    orderBy: { dueDate: 'desc' },
  });

  return fees.map(f => enrichWithLateFee(f));
};

function enrichWithLateFee(fee: any, config?: LateFeeConfig) {
  const cfg = config || { percentagePerDay: 0.5, maxLateFeePercent: 20, graceDays: 7 };
  const now = new Date();
  const dueDate = new Date(fee.dueDate);
  const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) - cfg.graceDays!;

  let lateFee = 0;
  const currentLateFee = extractLateFee(fee.remarks);

  if (fee.status !== 'PAID' && daysOverdue > 0) {
    lateFee = Math.min(
      fee.amount * (cfg.percentagePerDay! / 100) * daysOverdue,
      fee.amount * (cfg.maxLateFeePercent! / 100)
    );
  }

  return {
    ...fee,
    lateFee: Math.max(lateFee, currentLateFee),
    effectiveAmount: getEffectiveAmount(fee.amount, fee.remarks) + Math.max(lateFee, currentLateFee),
    discount: getDiscountAmount(fee.remarks),
    daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
  };
}

export const getFeeById = async (schoolId: string, feeId: string) => {
  const fee = await prisma.fee.findFirst({
    where: { id: feeId, schoolId },
    include: {
      student: {
        select: { id: true, name: true, rollNumber: true, class: { select: { name: true } }, section: { select: { name: true } } },
      },
    },
  });
  if (!fee) throw new AppError(404, 'NOT_FOUND', 'Fee record not found');
  return enrichWithLateFee(fee);
};

export const getReceiptData = async (schoolId: string, feeId: string) => {
  const fee = await prisma.fee.findFirst({
    where: { id: feeId, schoolId, status: 'PAID' },
    include: {
      student: {
        select: { id: true, name: true, rollNumber: true, class: { select: { name: true } }, section: { select: { name: true } } },
      },
    },
  });
  if (!fee) throw new AppError(404, 'NOT_FOUND', 'Paid fee record not found');

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { name: true, address: true, email: true, phone: true },
  });

  const enriched = enrichWithLateFee(fee);

  return {
    receiptNumber: fee.receiptUrl,
    transactionId: fee.paymentGatewayRef,
    schoolName: school?.name || 'School',
    schoolAddress: school?.address || '',
    schoolEmail: school?.email || '',
    schoolPhone: school?.phone || '',
    studentName: fee.student?.name || '',
    rollNumber: fee.student?.rollNumber || '',
    className: fee.student?.class?.name || '',
    sectionName: fee.student?.section?.name || '',
    feeType: fee.feeType,
    amount: fee.amount,
    lateFee: enriched.lateFee,
    discount: enriched.discount,
    paidAmount: fee.paidAmount,
    effectiveAmount: enriched.effectiveAmount,
    dueDate: fee.dueDate,
    paidAt: fee.paidAt,
    status: fee.status,
    createdAt: fee.createdAt,
  };
};

export const listReceipts = async (schoolId: string, studentId?: string) => {
  const where: Record<string, unknown> = { schoolId, status: 'PAID' };
  if (studentId) where.studentId = studentId;

  const receipts = await prisma.fee.findMany({
    where,
    orderBy: { paidAt: 'desc' },
    include: {
      student: {
        select: { id: true, name: true, rollNumber: true, class: { select: { name: true } } },
      },
    },
  });

  return receipts.map(f => enrichWithLateFee(f));
};

export const getStudentFees = async (schoolId: string, studentId: string) => {
  const student = await prisma.student.findFirst({ where: { id: studentId, schoolId } });
  if (!student) throw new AppError(404, 'NOT_FOUND', 'Student not found in this school');

  const fees = await prisma.fee.findMany({
    where: { schoolId, studentId },
    orderBy: { dueDate: 'desc' },
  });
  return fees.map(f => enrichWithLateFee(f));
};

// ─── Payment ────────────────────────────────────────────────
export const recordPayment = async (schoolId: string, feeId: string, data: PayFeeInput) => {
  const fee = await prisma.fee.findFirst({ where: { id: feeId, schoolId } });
  if (!fee) throw new AppError(404, 'NOT_FOUND', 'Fee record not found');
  if (fee.status === 'PAID') throw new AppError(400, 'ALREADY_PAID', 'This fee has already been paid');

  const totalLateFee = extractLateFee(fee.remarks);
  const totalPayable = fee.amount + totalLateFee;
  const totalPaid = fee.paidAmount + data.paidAmount;
  const newStatus = totalPaid >= totalPayable ? 'PAID' : totalPaid > 0 ? 'PARTIAL' : fee.status;
  const receiptUrl = data.paymentGatewayRef || generateReceiptNumber();

  return await prisma.fee.update({
    where: { id: feeId },
    data: {
      paidAmount: totalPaid,
      status: newStatus,
      paidAt: newStatus === 'PAID' ? new Date() : undefined,
      paymentGatewayRef: data.paymentGatewayRef,
      receiptUrl: newStatus === 'PAID' ? receiptUrl : undefined,
    },
    include: {
      student: {
        select: { id: true, name: true, rollNumber: true, class: { select: { name: true } } },
      },
    },
  });
};

// ─── Batch Checkout Payment ─────────────────────────────────
export const batchPayFees = async (schoolId: string, feeIds: string[], role: string, userId: string, paidAmounts?: Record<string, number>) => {
  const fees = await prisma.fee.findMany({
    where: { id: { in: feeIds }, schoolId },
    include: {
      student: {
        select: { id: true, name: true, rollNumber: true, class: { select: { name: true } }, section: { select: { name: true } }, userId: true },
      },
    },
  });

  if (fees.length === 0) throw new AppError(404, 'NOT_FOUND', 'No fee records found');

  // Verify ownership for students/parents
  if (role === 'STUDENT') {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) throw new AppError(404, 'NOT_FOUND', 'Student not found');
    const invalid = fees.find(f => f.studentId !== student.id);
    if (invalid) throw new AppError(403, 'FORBIDDEN', 'You can only pay your own fees');
  }

  if (role === 'PARENT') {
    const parent = await prisma.parent.findUnique({
      where: { userId },
      include: { children: { select: { id: true } } },
    });
    if (!parent) throw new AppError(404, 'NOT_FOUND', 'Parent not found');
    const childIds = parent.children.map(c => c.id);
    const invalid = fees.find(f => !childIds.includes(f.studentId));
    if (invalid) throw new AppError(403, 'FORBIDDEN', 'You can only pay fees for your children');
  }

  const results: Array<{ id: string; status: string; receiptUrl: string | null; paidAmount: number; error?: string }> = [];

  for (const fee of fees) {
    try {
      if (fee.status === 'PAID') {
        results.push({ id: fee.id, status: 'ALREADY_PAID', receiptUrl: fee.receiptUrl, paidAmount: 0 });
        continue;
      }

      const totalLateFee = extractLateFee(fee.remarks);
      const totalPayable = fee.amount + totalLateFee;
      const amountToPay = paidAmounts?.[fee.id] || totalPayable - fee.paidAmount;

      const totalPaid = fee.paidAmount + amountToPay;
      const newStatus = totalPaid >= totalPayable ? 'PAID' : totalPaid > 0 ? 'PARTIAL' : fee.status;
      const receiptUrl = generateReceiptNumber();

      await prisma.fee.update({
        where: { id: fee.id },
        data: {
          paidAmount: totalPaid,
          status: newStatus,
          paidAt: newStatus === 'PAID' ? new Date() : undefined,
          paymentGatewayRef: `ONLINE-${receiptUrl}`,
          receiptUrl: newStatus === 'PAID' ? receiptUrl : undefined,
        },
      });

      if (newStatus === 'PAID' && fee.student?.userId) {
        await prisma.notification.create({
          data: {
            schoolId,
            recipientId: fee.student.userId,
            title: `Payment Received: ${fee.feeType}`,
            message: `Your ${fee.feeType} of ₹${totalPayable} has been paid successfully. Receipt: ${receiptUrl}`,
            type: 'FEE',
            sentVia: ['IN_APP'],
            metadata: { feeId: fee.id, receiptUrl, amount: totalPayable, feeType: fee.feeType, transactionId: `ONLINE-${receiptUrl}` },
          },
        });
      }

      if (newStatus === 'PAID') {
        const parent = await prisma.parent.findFirst({
          where: { schoolId, children: { some: { id: fee.studentId } } },
          include: { user: { select: { id: true } } },
        });
        if (parent?.user?.id) {
          await prisma.notification.create({
            data: {
              schoolId,
              recipientId: parent.user.id,
              title: `Payment Confirmed: ${fee.student?.name || 'Student'} — ${fee.feeType}`,
              message: `The ${fee.feeType} fee of ₹${totalPayable} for ${fee.student?.name || 'your child'} has been paid successfully. Receipt: ${receiptUrl}`,
              type: 'FEE',
              sentVia: ['IN_APP'],
              metadata: { feeId: fee.id, studentId: fee.studentId, receiptUrl, amount: totalPayable, feeType: fee.feeType },
            },
          });
        }
      }

      results.push({ id: fee.id, status: newStatus, receiptUrl: newStatus === 'PAID' ? receiptUrl : null, paidAmount: amountToPay });
    } catch (err: any) {
      results.push({ id: fee.id, status: 'FAILED', receiptUrl: null, paidAmount: 0, error: err.message });
    }
  }

  const transactionId = `TXN-${Date.now().toString(36).toUpperCase()}`;
  return { transactionId, results };
};

// ─── Apply Late Fees ────────────────────────────────────────
export const applyLateFees = async (schoolId: string, config?: LateFeeConfig) => {
  const cfg = config || { percentagePerDay: 0.5, maxLateFeePercent: 20, graceDays: 7 };
  const overdueFees = await prisma.fee.findMany({
    where: {
      schoolId,
      status: { in: ['PENDING', 'PARTIAL'] },
      dueDate: { lt: new Date(Date.now() - (cfg.graceDays || 7) * 24 * 60 * 60 * 1000) },
    },
  });

  const updated: Array<{ id: string; lateFee: number; totalNow: number }> = [];

  for (const fee of overdueFees) {
    const daysOverdue = Math.floor(
      (Date.now() - new Date(fee.dueDate).getTime()) / (1000 * 60 * 60 * 24)
    ) - (cfg.graceDays || 7);

    if (daysOverdue <= 0) continue;

    const newLateFee = Math.min(
      fee.amount * (cfg.percentagePerDay! / 100) * daysOverdue,
      fee.amount * (cfg.maxLateFeePercent! / 100)
    );

    const currentLateFee = extractLateFee(fee.remarks);
    if (newLateFee <= currentLateFee) continue;

    const updatedRemarks = buildRemarks(fee.remarks, {
      lateFee: Math.round(newLateFee * 100) / 100,
      lateFeeAppliedAt: new Date().toISOString(),
      lateFeeDaysOverdue: daysOverdue,
    });

    await prisma.fee.update({
      where: { id: fee.id },
      data: {
        status: 'OVERDUE',
        remarks: updatedRemarks,
      },
    });

    updated.push({ id: fee.id, lateFee: newLateFee, totalNow: fee.amount + newLateFee });
  }

  return { updated: updated.length, details: updated };
};

// ─── Send Reminders ─────────────────────────────────────────
export const sendFeeReminders = async (schoolId: string, feeIds: string[], customMessage?: string) => {
  const fees = await prisma.fee.findMany({
    where: { id: { in: feeIds }, schoolId },
    include: {
      student: {
        include: { user: { select: { id: true } } },
      },
    },
  });

  if (fees.length === 0) throw new AppError(404, 'NOT_FOUND', 'No fee records found');

  const notifications: Array<{
    schoolId: string;
    recipientId: string;
    title: string;
    message: string;
    type: 'FEE';
    metadata: any;
  }> = [];

  for (const fee of fees) {
    const daysOverdue = Math.max(0, Math.floor(
      (Date.now() - new Date(fee.dueDate).getTime()) / (1000 * 60 * 60 * 24)
    ));

    const baseMessage = customMessage || `Your ${fee.feeType} of ₹${fee.amount} was due on ${new Date(fee.dueDate).toLocaleDateString()}. Please pay at the earliest to avoid late fees.`;

    const title = daysOverdue > 0
      ? `⏰ Fee Reminder: ${fee.feeType} (${daysOverdue} days overdue)`
      : `📋 Fee Notice: ${fee.feeType} due soon`;

    if (fee.student?.user?.id) {
      notifications.push({
        schoolId,
        recipientId: fee.student.user.id,
        title,
        message: baseMessage,
        type: 'FEE',
        metadata: { feeId: fee.id, feeType: fee.feeType, amount: fee.amount, dueDate: fee.dueDate },
      });
    }

    // Also find parent linked to this student
    const parent = await prisma.parent.findFirst({
      where: { schoolId, children: { some: { id: fee.studentId } } },
      include: { user: { select: { id: true } } },
    });

    if (parent?.user?.id) {
      notifications.push({
        schoolId,
        recipientId: parent.user.id,
        title: `Fee Reminder: ${fee.student.name} — ${fee.feeType}`,
        message: `This is a reminder that ${fee.student.name}'s ${fee.feeType} of ₹${fee.amount} is due. ${daysOverdue > 0 ? `(Overdue by ${daysOverdue} days)` : ''}`,
        type: 'FEE',
        metadata: { feeId: fee.id, studentId: fee.studentId, feeType: fee.feeType, amount: fee.amount },
      });
    }
  }

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications });
  }

  // Update lastReminderSent in remarks
  for (const fee of fees) {
    const updatedRemarks = buildRemarks(fee.remarks, {
      lastReminderSent: new Date().toISOString(),
      reminderCount: ((extractLateFee(fee.remarks) > 0 ? 1 : 0) + 1),
    });
    await prisma.fee.update({
      where: { id: fee.id },
      data: { remarks: updatedRemarks },
    });
  }

  return { sent: notifications.length, students: fees.length };
};

// ─── Stats ──────────────────────────────────────────────────
export const getFeeStats = async (schoolId: string) => {
  const fees = await prisma.fee.findMany({
    where: { schoolId },
    include: { student: { select: { class: { select: { name: true } } } } },
  });

  const enriched = fees.map(f => enrichWithLateFee(f));

  const totalFees = enriched.length;
  const totalCollected = enriched.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalOutstanding = enriched.reduce((sum, f) => sum + (f.effectiveAmount - f.paidAmount), 0);
  const pendingCount = enriched.filter(f => f.status === 'PENDING' || f.status === 'OVERDUE').length;
  const paidCount = enriched.filter(f => f.status === 'PAID').length;
  const partialCount = enriched.filter(f => f.status === 'PARTIAL').length;
  const overdueCount = enriched.filter(f => f.status === 'OVERDUE').length;
  const totalLateFees = enriched.reduce((sum, f) => sum + f.lateFee, 0);

  const collectionRate = totalFees > 0 ? Math.round((paidCount / totalFees) * 100) : 0;
  const amountCollectionRate = totalFees > 0
    ? Math.round((totalCollected / (totalCollected + totalOutstanding)) * 100)
    : 0;

  const classBreakdown = enriched.reduce<Record<string, { total: number; collected: number; count: number; lateFees: number }>>((acc, f) => {
    const className = f.student?.class?.name || 'Unknown';
    if (!acc[className]) acc[className] = { total: 0, collected: 0, count: 0, lateFees: 0 };
    acc[className].total += f.amount;
    acc[className].collected += f.paidAmount;
    acc[className].count += 1;
    acc[className].lateFees += f.lateFee;
    return acc;
  }, {});

  const monthlyMap = enriched.reduce<Record<string, { collected: number; outstanding: number }>>((acc, f) => {
    const monthKey = new Date(f.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short' });
    if (!acc[monthKey]) acc[monthKey] = { collected: 0, outstanding: 0 };
    acc[monthKey].collected += f.paidAmount;
    acc[monthKey].outstanding += f.effectiveAmount - f.paidAmount;
    return acc;
  }, {});

  const monthlyData = Object.entries(monthlyMap)
    .map(([month, d]) => ({ month, ...d }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  return {
    totalFees,
    totalCollected,
    totalOutstanding,
    totalLateFees,
    pendingCount, paidCount, partialCount, overdueCount,
    collectionRate, amountCollectionRate,
    monthlyData, classBreakdown,
    recentFees: enriched.slice(0, 10),
  };
};

export const deleteFeeRecord = async (schoolId: string, feeId: string) => {
  const fee = await prisma.fee.findFirst({ where: { id: feeId, schoolId } });
  if (!fee) throw new AppError(404, 'NOT_FOUND', 'Fee record not found');
  return await prisma.fee.delete({ where: { id: feeId } });
};

// ─── Installment Plans ──────────────────────────────────────

function calculateInstallmentDates(firstDueDate: string, numberOfInstallments: number, frequency: string): Date[] {
  const dates: Date[] = [];
  const start = new Date(firstDueDate);
  for (let i = 0; i < numberOfInstallments; i++) {
    const d = new Date(start);
    if (frequency === 'monthly') d.setMonth(d.getMonth() + i);
    else if (frequency === 'quarterly') d.setMonth(d.getMonth() + i * 3);
    else if (frequency === 'half_yearly') d.setMonth(d.getMonth() + i * 6);
    dates.push(d);
  }
  return dates;
}

export const createInstallmentPlan = async (schoolId: string, data: InstallmentPlanInput) => {
  const installmentGroupId = crypto.randomUUID();
  const perInstallment = Math.round((data.totalAmount / data.numberOfInstallments) * 100) / 100;
  const dueDates = calculateInstallmentDates(data.firstDueDate, data.numberOfInstallments, data.frequency);
  const discount = data.discount || 0;

  let targetStudents: Array<{ id: string; name: string; rollNumber: string }> = [];

  if (data.studentId) {
    const student = await prisma.student.findFirst({
      where: { id: data.studentId, schoolId },
      select: { id: true, name: true, rollNumber: true },
    });
    if (!student) throw new AppError(404, 'NOT_FOUND', 'Student not found');
    targetStudents = [student];
  } else if (data.classId) {
    const where: any = { schoolId, classId: data.classId, isActive: true };
    if (data.sectionId) where.sectionId = data.sectionId;
    targetStudents = await prisma.student.findMany({
      where,
      select: { id: true, name: true, rollNumber: true },
    });
    if (targetStudents.length === 0) throw new AppError(400, 'NO_STUDENTS', 'No active students found');
  }

  const created: Array<Record<string, unknown>> = [];

  for (const student of targetStudents) {
    for (let i = 0; i < data.numberOfInstallments; i++) {
      const installmentRemarks = JSON.stringify({
        installmentGroupId,
        installmentNumber: i + 1,
        totalInstallments: data.numberOfInstallments,
        frequency: data.frequency,
        totalPlanAmount: data.totalAmount,
        discount,
        discountReason: data.discountReason || (discount > 0 ? 'Installment plan discount' : undefined),
        note: data.remarks || null,
        perInstallment,
      });

      const fee = await prisma.fee.create({
        data: {
          schoolId,
          studentId: student.id,
          feeType: `${data.feeType} (Installment ${i + 1}/${data.numberOfInstallments})`,
          amount: perInstallment,
          dueDate: dueDates[i],
          status: 'PENDING',
          remarks: installmentRemarks,
        },
        include: {
          student: {
            select: { id: true, name: true, rollNumber: true, class: { select: { name: true } } },
          },
        },
      });
      created.push(fee);
    }
  }

  return {
    installmentGroupId,
    totalAmount: data.totalAmount,
    numberOfInstallments: data.numberOfInstallments,
    perInstallment,
    frequency: data.frequency,
    studentsCount: targetStudents.length,
    totalFeesCreated: targetStudents.length * data.numberOfInstallments,
    fees: created,
  };
};

export const getInstallmentGroup = async (schoolId: string, groupId: string) => {
  const allFees = await prisma.fee.findMany({
    where: { schoolId },
    include: {
      student: {
        select: { id: true, name: true, rollNumber: true, class: { select: { name: true } } },
      },
    },
  });

  const groupFees = allFees.filter(f => {
    try {
      const r = JSON.parse(f.remarks || '{}');
      return r.installmentGroupId === groupId;
    } catch { return false; }
  });

  if (groupFees.length === 0) throw new AppError(404, 'NOT_FOUND', 'Installment group not found');

  const enriched = groupFees.map(f => enrichWithLateFee(f));
  const firstRemarks = JSON.parse(groupFees[0].remarks || '{}');
  const totalPaid = enriched.filter(f => f.status === 'PAID').reduce((s, f) => s + f.amount, 0);
  const totalPending = enriched.filter(f => f.status !== 'PAID' && f.status !== 'WAIVED').reduce((s, f) => s + (f.effectiveAmount - f.paidAmount), 0);

  return {
    installmentGroupId: groupId,
    frequency: firstRemarks.frequency,
    totalInstallments: firstRemarks.totalInstallments,
    totalPlanAmount: firstRemarks.totalPlanAmount,
    perInstallment: firstRemarks.perInstallment,
    totalPaid,
    totalPending,
    paidCount: enriched.filter(f => f.status === 'PAID').length,
    fees: enriched,
  };
};

// ─── Waiver / Concession ─────────────────────────────────────
export const applyWaiver = async (schoolId: string, data: WaiverInput) => {
  const fees = await prisma.fee.findMany({
    where: { id: { in: data.feeIds }, schoolId, status: { not: 'PAID' } },
    include: { student: { select: { name: true } } },
  });

  if (fees.length === 0) throw new AppError(404, 'NOT_FOUND', 'No eligible fee records found (must be unpaid)');

  const updated = [];
  for (const fee of fees) {
    const updatedRemarks = buildRemarks(fee.remarks, {
      waivedAt: new Date().toISOString(),
      waiverReason: data.reason,
      previousStatus: fee.status,
    });

    await prisma.fee.update({
      where: { id: fee.id },
      data: { status: 'WAIVED', remarks: updatedRemarks },
    });
    updated.push({ id: fee.id, student: fee.student?.name, feeType: fee.feeType, amount: fee.amount });
  }

  return { waived: updated.length, totalAmount: updated.reduce((s, f) => s + f.amount, 0), fees: updated };
};

export const getWaiverStats = async (schoolId: string) => {
  const waived = await prisma.fee.findMany({
    where: { schoolId, status: 'WAIVED' },
  });

  const totalWaived = waived.reduce((s, f) => s + f.amount, 0);
  const byReason = waived.reduce<Record<string, number>>((acc, f) => {
    try {
      const r = JSON.parse(f.remarks || '{}');
      const reason = r.waiverReason || 'Unknown';
      acc[reason] = (acc[reason] || 0) + f.amount;
    } catch { acc['Unknown'] = (acc['Unknown'] || 0) + f.amount; }
    return acc;
  }, {});

  return { totalWaived, count: waived.length, byReason };
};

// ─── Update Fee ──────────────────────────────────────────────
export const updateFeeRecord = async (schoolId: string, feeId: string, data: UpdateFeeInput) => {
  const fee = await prisma.fee.findFirst({ where: { id: feeId, schoolId } });
  if (!fee) throw new AppError(404, 'NOT_FOUND', 'Fee record not found');
  if (fee.status === 'PAID') throw new AppError(400, 'ALREADY_PAID', 'Cannot edit a paid fee record');

  const updateData: Record<string, unknown> = {};
  if (data.feeType) updateData.feeType = data.feeType;
  if (data.amount) updateData.amount = data.amount;
  if (data.dueDate) updateData.dueDate = new Date(data.dueDate);

  if (data.discount !== undefined || data.discountReason !== undefined || data.remarks !== undefined) {
    const currentRemarks: Record<string, unknown> = {};
    try { Object.assign(currentRemarks, JSON.parse(fee.remarks || '{}')); } catch {}
    if (data.discount !== undefined) {
      currentRemarks.discount = data.discount;
      currentRemarks.discountReason = data.discountReason || (data.discount > 0 ? 'Updated by admin' : undefined);
      updateData.amount = fee.amount - fee.amount + (fee.amount - (fee.amount - (currentRemarks.discount as number || 0)));
    }
    if (data.remarks !== undefined) currentRemarks.note = data.remarks;
    updateData.remarks = JSON.stringify(currentRemarks);
  }

  return await prisma.fee.update({
    where: { id: feeId },
    data: updateData,
    include: {
      student: {
        select: { id: true, name: true, rollNumber: true, class: { select: { name: true } } },
      },
    },
  });
};

// ─── Bulk Delete ─────────────────────────────────────────────
export const bulkDeleteFees = async (schoolId: string, data: BulkDeleteInput) => {
  const fees = await prisma.fee.findMany({
    where: { id: { in: data.feeIds }, schoolId },
  });

  if (fees.length === 0) throw new AppError(404, 'NOT_FOUND', 'No fee records found');

  const paidFees = fees.filter(f => f.status === 'PAID');
  if (paidFees.length > 0) {
    throw new AppError(400, 'HAS_PAID_FEES', `${paidFees.length} fee(s) are already paid and cannot be deleted`);
  }

  const result = await prisma.fee.deleteMany({
    where: { id: { in: data.feeIds }, schoolId },
  });

  return { deleted: result.count };
};

// ─── Fee Templates ───────────────────────────────────────────
export const createFeeTemplateService = async (schoolId: string, data: CreateFeeTemplateInput) => {
  const template = await prisma.feeTemplate.create({
    data: {
      schoolId,
      name: data.name,
      description: data.description,
      items: data.items as any,
    },
  });
  return template;
};

export const listFeeTemplates = async (schoolId: string) => {
  return await prisma.feeTemplate.findMany({
    where: { schoolId },
    orderBy: { createdAt: 'desc' },
  });
};

export const getFeeTemplate = async (schoolId: string, templateId: string) => {
  const template = await prisma.feeTemplate.findFirst({
    where: { id: templateId, schoolId },
  });
  if (!template) throw new AppError(404, 'NOT_FOUND', 'Fee template not found');
  return template;
};

export const deleteFeeTemplateService = async (schoolId: string, templateId: string) => {
  const template = await prisma.feeTemplate.findFirst({
    where: { id: templateId, schoolId },
  });
  if (!template) throw new AppError(404, 'NOT_FOUND', 'Fee template not found');
  await prisma.feeTemplate.delete({ where: { id: templateId } });
  return { deleted: true };
};

export const applyFeeTemplateToClass = async (schoolId: string, data: ApplyFeeTemplateInput) => {
  const template = await prisma.feeTemplate.findFirst({
    where: { id: data.templateId, schoolId },
  });
  if (!template) throw new AppError(404, 'NOT_FOUND', 'Fee template not found');

  const items = template.items as Array<{ feeType: string; amount: number; dueDate: string; discount?: number; discountReason?: string }>;

  const whereStudents: any = { schoolId, classId: data.classId, isActive: true };
  if (data.sectionId) whereStudents.sectionId = data.sectionId;

  const students = await prisma.student.findMany({ where: whereStudents });
  if (students.length === 0) throw new AppError(400, 'NO_STUDENTS', 'No active students found');

  let created = 0;
  let skipped = 0;

  for (const student of students) {
    for (const item of items) {
      const existing = await prisma.fee.findFirst({
        where: {
          schoolId,
          studentId: student.id,
          feeType: item.feeType,
          dueDate: new Date(item.dueDate),
        },
      });
      if (existing) { skipped++; continue; }

      const discount = item.discount || 0;
      const netAmount = item.amount - discount;
      const remarks = JSON.stringify({
        discount,
        discountReason: item.discountReason || (discount > 0 ? 'Template discount' : undefined),
        templateId: data.templateId,
        templateName: template.name,
      });

      await prisma.fee.create({
        data: {
          schoolId,
          studentId: student.id,
          feeType: item.feeType,
          amount: netAmount,
          dueDate: new Date(item.dueDate),
          status: 'PENDING',
          remarks,
        },
      });
      created++;
    }
  }

  return {
    templateName: template.name,
    studentsCount: students.length,
    itemsCount: items.length,
    created,
    skipped,
    total: students.length * items.length,
  };
};
