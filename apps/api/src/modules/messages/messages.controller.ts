import { Request, Response } from 'express';
import * as messagesService from './messages.service';
import { sendMessageSchema } from './messages.schema';

export const send = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user!.sub;
  const input = sendMessageSchema.parse(req.body);
  const msg = await messagesService.sendMessage(schoolId, userId, input);
  res.status(201).json({ success: true, data: msg });
};

export const listConversations = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user!.sub;
  const conversations = await messagesService.getConversations(schoolId, userId);
  res.status(200).json({ success: true, data: conversations });
};

export const getConversation = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user!.sub;
  const { otherUserId } = req.params;
  const messages = await messagesService.getConversation(schoolId, userId, otherUserId);
  res.status(200).json({ success: true, data: messages });
};
