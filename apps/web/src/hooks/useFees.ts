'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface FeeRecord {
  id: string;
  schoolId: string;
  studentId: string;
  feeType: string;
  amount: number;
  dueDate: string;
  paidAmount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL' | 'WAIVED';
  paidAt: string | null;
  paymentGatewayRef: string | null;
  receiptUrl: string | null;
  remarks: string | null;
  createdAt: string;
  lateFee: number;
  effectiveAmount: number;
  discount: number;
  daysOverdue: number;
  student: {
    id: string;
    name: string;
    rollNumber: string;
    class: { name: string };
    section?: { name: string };
  };
}

export interface FeeStats {
  totalFees: number;
  totalCollected: number;
  totalOutstanding: number;
  totalLateFees: number;
  pendingCount: number;
  paidCount: number;
  partialCount: number;
  overdueCount: number;
  collectionRate: number;
  amountCollectionRate: number;
  monthlyData: Array<{ month: string; collected: number; outstanding: number }>;
  classBreakdown: Record<string, { total: number; collected: number; count: number; lateFees: number }>;
  recentFees: FeeRecord[];
}

export function useFees(studentId?: string) {
  return useQuery<FeeRecord[]>({
    queryKey: ['fees', studentId],
    queryFn: async () => {
      const params = studentId ? { studentId } : {};
      const { data } = await api.get('/fees', { params });
      return data.data;
    },
  });
}

export function useFeeStats() {
  return useQuery<FeeStats>({
    queryKey: ['fees', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/fees/stats');
      return data.data;
    },
  });
}

export function useFee(id: string) {
  return useQuery<FeeRecord>({
    queryKey: ['fees', id],
    queryFn: async () => {
      const { data } = await api.get(`/fees/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      studentId: string;
      feeType: string;
      amount: number;
      dueDate: string;
      discount?: number;
      discountReason?: string;
      remarks?: string;
    }) => {
      const { data } = await api.post('/fees', payload);
      return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fees'] }); },
  });
}

export function useBulkCreateFees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      classId: string;
      sectionId?: string;
      feeType: string;
      amount: number;
      dueDate: string;
      discount?: number;
      discountReason?: string;
      remarks?: string;
    }) => {
      const { data } = await api.post('/fees/bulk', payload);
      return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fees'] }); },
  });
}

export function usePayFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ feeId, paidAmount, paymentGatewayRef }: {
      feeId: string; paidAmount: number; paymentGatewayRef?: string;
    }) => {
      const { data } = await api.post(`/fees/${feeId}/pay`, { paidAmount, paymentGatewayRef });
      return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fees'] }); },
  });
}

export function useCheckoutPay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { feeIds: string[]; paidAmounts?: Record<string, number> }) => {
      const { data } = await api.post('/fees/checkout', payload);
      return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fees'] }); },
  });
}

export function useApplyLateFees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config?: { percentagePerDay?: number; maxLateFeePercent?: number; graceDays?: number }) => {
      const { data } = await api.post('/fees/apply-late-fees', config || {});
      return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fees'] }); },
  });
}

export function useSendReminders() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { feeIds: string[]; message?: string }) => {
      const { data } = await api.post('/fees/send-reminders', payload);
      return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fees'] }); },
  });
}

export function useDeleteFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (feeId: string) => {
      const { data } = await api.delete(`/fees/${feeId}`);
      return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fees'] }); },
  });
}

export function useApplyWaiver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { feeIds: string[]; reason: string }) => {
      const { data } = await api.post('/fees/apply-waiver', payload);
      return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fees'] }); },
  });
}

export function useWaiverStats() {
  return useQuery({
    queryKey: ['fees', 'waiver-stats'],
    queryFn: async () => {
      const { data } = await api.get('/fees/waiver-stats');
      return data.data as { totalWaived: number; count: number; byReason: Record<string, number> };
    },
  });
}

export function useUpdateFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ feeId, ...payload }: { feeId: string; feeType?: string; amount?: number; dueDate?: string; discount?: number; discountReason?: string; remarks?: string }) => {
      const { data } = await api.patch(`/fees/${feeId}`, payload);
      return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fees'] }); },
  });
}

export function useBulkDeleteFees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (feeIds: string[]) => {
      const { data } = await api.post('/fees/bulk-delete', { feeIds });
      return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fees'] }); },
  });
}
