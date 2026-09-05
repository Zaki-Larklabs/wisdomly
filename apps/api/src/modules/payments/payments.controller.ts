import { Request, Response } from 'express';
import * as paymentService from './payments.service';
import { createCheckoutSchema } from './payments.schema';

export const createCheckout = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user?.sub!;
  const { feeId } = createCheckoutSchema.parse(req.body);
  const result = await paymentService.createCheckoutSession(schoolId, userId, feeId);
  res.status(200).json({ success: true, data: result, meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() } });
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const body = req.body;
  await paymentService.handleWebhook(body, signature);
  res.status(200).json({ received: true });
};

export const webhook = handleStripeWebhook;

export const verifySession = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const result = await paymentService.verifySession(sessionId);
  res.status(200).json({ success: true, data: result, meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() } });
};
