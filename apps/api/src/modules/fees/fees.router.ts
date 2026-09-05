import { Router } from 'express';
import { createFee, bulkCreateFee, listFees, getFee, payFee, checkoutPay, applyLateFees, sendReminders, feeStats, deleteFee, createInstallmentPlan, getInstallmentGroup, applyWaiver, waiverStats, updateFee, bulkDeleteFees, getReceipt, listReceipts, createFeeTemplateCtrl, listFeeTemplatesCtrl, getFeeTemplateCtrl, deleteFeeTemplateCtrl, applyFeeTemplateCtrl } from './fees.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Admin-only management endpoints
router.get('/stats', rbac(['ADMIN', 'SUPER_ADMIN']), asyncHandler(feeStats));
router.post('/bulk', rbac(['ADMIN', 'SUPER_ADMIN']), asyncHandler(bulkCreateFee));
router.post('/apply-late-fees', rbac(['ADMIN', 'SUPER_ADMIN']), asyncHandler(applyLateFees));
router.post('/send-reminders', rbac(['ADMIN', 'SUPER_ADMIN']), asyncHandler(sendReminders));
router.post('/', rbac(['ADMIN', 'SUPER_ADMIN']), asyncHandler(createFee));
router.delete('/:id', rbac(['ADMIN', 'SUPER_ADMIN']), asyncHandler(deleteFee));

// Read access for any authenticated role
router.get('/', asyncHandler(listFees));
router.get('/:id', asyncHandler(getFee));

// Online checkout — students and parents can pay their own fees
router.post('/checkout', rbac(['STUDENT', 'PARENT', 'ADMIN', 'SUPER_ADMIN']), asyncHandler(checkoutPay));

// Installment Plans
router.post('/installment-plan', rbac(['ADMIN', 'SUPER_ADMIN']), asyncHandler(createInstallmentPlan));
router.get('/installment-group/:groupId', asyncHandler(getInstallmentGroup));

// Waiver / Concession
router.post('/apply-waiver', rbac(['ADMIN', 'SUPER_ADMIN']), asyncHandler(applyWaiver));
router.get('/waiver-stats', rbac(['ADMIN', 'SUPER_ADMIN']), asyncHandler(waiverStats));

// Bulk operations
router.post('/bulk-delete', rbac(['ADMIN', 'SUPER_ADMIN']), asyncHandler(bulkDeleteFees));

// Fee Templates
router.get('/templates', rbac(['ADMIN', 'SUPER_ADMIN']), asyncHandler(listFeeTemplatesCtrl));
router.post('/templates', rbac(['ADMIN', 'SUPER_ADMIN']), asyncHandler(createFeeTemplateCtrl));
router.get('/templates/:id', rbac(['ADMIN', 'SUPER_ADMIN']), asyncHandler(getFeeTemplateCtrl));
router.delete('/templates/:id', rbac(['ADMIN', 'SUPER_ADMIN']), asyncHandler(deleteFeeTemplateCtrl));
router.post('/templates/apply', rbac(['ADMIN', 'SUPER_ADMIN']), asyncHandler(applyFeeTemplateCtrl));

// Receipts — accessible by any authenticated user
router.get('/receipts', asyncHandler(listReceipts));
router.get('/:id/receipt', asyncHandler(getReceipt));

// Admin direct payment & update
router.post('/:id/pay', rbac(['ADMIN', 'SUPER_ADMIN']), asyncHandler(payFee));
router.patch('/:id', rbac(['ADMIN', 'SUPER_ADMIN']), asyncHandler(updateFee));

export default router;
