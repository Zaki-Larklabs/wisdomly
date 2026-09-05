import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Notification {
  id: string;
  schoolId: string;
  recipientId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface PaginatedResponse<T> {
  notifications: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useNotifications = (page = 1, limit = 20, unreadOnly = false) => {
  return useQuery({
    queryKey: ['notifications', page, limit, unreadOnly],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit), unreadOnly: String(unreadOnly) });
      const { data } = await api.get<{ success: boolean; data: PaginatedResponse<Notification> }>(`/notifications?${params}`);
      return data.data;
    },
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: { count: number } }>('/notifications/unread-count');
      return data.data.count;
    },
    refetchInterval: 30000,
  });
};

export const useMarkRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data } = await api.patch('/notifications/read', { ids });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch('/notifications/read-all');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};
