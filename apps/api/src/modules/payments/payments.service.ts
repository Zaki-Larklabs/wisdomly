import Stripe from 'stripe';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-03-31-basil' as any });

export const createCheckoutSession = async (schoolId: string, userId: string, feeId: string) => {
  const fee = await prisma.fee.findFirst({
    where: { id: feeId, schoolId, student: { userId } },
    include: { student: true }
  });
  if (!fee) throw new AppError(404, 'NOT_FOUND', 'Fee not found');
  if (fee.status === 'PAID' || fee.status === 'WAIVED') {
    throw new AppError(409, 'ALREADY_PAID', 'This fee has already been paid');
  }

  const remaining = fee.amount - fee.paidAmount;
  if (remaining <= 0) throw new AppError(409, 'ALREADY_PAID', 'No outstanding amount');

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'inr',
        product_data: {
          name: fee.feeType,
          description: `Fee for ${fee.student.name}`,
        },
        unit_amount: Math.round(remaining * 100), // paise
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${env.FRONTEND_URL}/dashboard/payment/success?session_id={CHECKOUT_SESSION_ID}&fee_id=${fee.id}`,
    cancel_url: `${env.FRONTEND_URL}/dashboard/student/fees`,
    metadata: {
      schoolId,
      feeId: fee.id,
      userId,
    },
  });

  // Store the session reference
  const remarks = fee.remarks ? JSON.parse(fee.remarks) : {};
  await prisma.fee.update({
    where: { id: fee.id },
    data: { remarks: JSON.stringify({ ...remarks, stripeSessionId: session.id }) }
  });

  return { url: session.url, sessionId: session.id };
};

export const handleWebhook = async (body: any, signature: string) => {
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    throw new AppError(400, 'WEBHOOK_ERROR', 'Invalid signature');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const feeId = session.metadata?.feeId;
    const schoolId = session.metadata?.schoolId;

    if (feeId && schoolId) {
      const amountPaid = (session.amount_total || 0) / 100;

      await prisma.fee.update({
        where: { id: feeId },
        data: {
          status: 'PAID',
          paidAmount: amountPaid,
          paidAt: new Date(),
          paymentGatewayRef: session.id,
        }
      });

      // Create notification
      await prisma.notification.create({
        data: {
          schoolId,
          recipientId: session.metadata!.userId,
          title: 'Payment Successful',
          message: `Payment of ₹${amountPaid} for fee has been processed successfully.`,
          type: 'FEE',
          sentVia: ['IN_APP'],
        }
      });
    }
  }

  return { received: true };
};

export const verifySession = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return {
    id: session.id,
    status: session.payment_status,
    amountTotal: (session.amount_total || 0) / 100,
    paymentStatus: session.payment_status,
  };
};
