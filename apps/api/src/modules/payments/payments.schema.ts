import { z } from 'zod';

export const createCheckoutSchema = z.object({
  feeId: z.string().cuid(),
});
