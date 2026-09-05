import { z } from 'zod';

export const sendMessageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1, 'Message cannot be empty'),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
