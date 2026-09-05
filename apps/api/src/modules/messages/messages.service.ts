import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { SendMessageInput } from './messages.schema';

export const sendMessage = async (schoolId: string, senderId: string, input: SendMessageInput) => {
  const receiver = await prisma.user.findFirst({ where: { id: input.receiverId, schoolId } });
  if (!receiver) throw new AppError(404, 'NOT_FOUND', 'Recipient not found');

  return await prisma.message.create({
    data: { schoolId, senderId, receiverId: input.receiverId, content: input.content },
    include: { sender: { select: { id: true, role: true } } },
  });
};

export const getConversations = async (schoolId: string, userId: string) => {
  const messages = await prisma.message.findMany({
    where: { schoolId, OR: [{ senderId: userId }, { receiverId: userId }] },
    orderBy: { sentAt: 'desc' },
    include: {
      sender: { select: { id: true, role: true } },
    },
  });

  const convMap = new Map<string, { userId: string; role: string; lastMessage: string; sentAt: Date; unread: number }>();
  for (const msg of messages) {
    const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (!convMap.has(otherId)) {
      convMap.set(otherId, {
        userId: otherId,
        role: msg.senderId === userId ? '' : msg.sender.role,
        lastMessage: msg.content,
        sentAt: msg.sentAt,
        unread: (!msg.isRead && msg.receiverId === userId) ? 1 : 0,
      });
    } else if (!msg.isRead && msg.receiverId === userId) {
      convMap.get(otherId)!.unread++;
    }
  }

  return Array.from(convMap.values()).sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
};

export const getConversation = async (schoolId: string, userId: string, otherUserId: string) => {
  const messages = await prisma.message.findMany({
    where: {
      schoolId,
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    orderBy: { sentAt: 'asc' },
    include: { sender: { select: { id: true, role: true } } },
  });

  // Mark incoming messages as read
  await prisma.message.updateMany({
    where: { schoolId, senderId: otherUserId, receiverId: userId, isRead: false },
    data: { isRead: true },
  });

  return messages;
};
