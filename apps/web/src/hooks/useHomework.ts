import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface HomeworkItem {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  fileUrl: string | null;
  createdAt: string;
  subject: { name: string; code: string };
  class: { name: string };
  teacher: { name: string };
  _count?: { submissions: number };
}

export interface HomeworkSubmission {
  id: string;
  status: 'PENDING' | 'SUBMITTED' | 'LATE_SUBMITTED' | 'GRADED';
  submittedAt: string | null;
  fileUrl: string | null;
  grade: string | null;
  feedback: string | null;
  student: { id: string; name: string; rollNumber: string };
}

export interface HomeworkDetail extends HomeworkItem {
  submissions: HomeworkSubmission[];
}

export const useTeacherHomework = (params?: { classId?: string; subjectId?: string }) => {
  return useQuery({
    queryKey: ['teacher-homework', params],
    queryFn: async () => {
      const { data } = await api.get('/homework', { params });
      return data.data as { items: HomeworkItem[]; total: number; page: number; pageSize: number; totalPages: number };
    },
  });
};

export const useHomeworkDetail = (id: string) => {
  return useQuery({
    queryKey: ['homework-detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/homework/${id}`);
      return data.data as HomeworkDetail;
    },
    enabled: !!id,
  });
};

export const useCreateHomework = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { classId: string; subjectId: string; title: string; description?: string; dueDate: string; fileUrl?: string }) => {
      const { data } = await api.post('/homework', payload);
      return data.data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teacher-homework'] }); },
  });
};

export const useGradeSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ submissionId, grade, feedback }: { submissionId: string; grade: string; feedback?: string }) => {
      const { data } = await api.post(`/homework/submissions/${submissionId}/grade`, { grade, feedback, status: 'GRADED' });
      return data.data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['homework-detail'] }); },
  });
};

export const useStudentHomework = () => {
  return useQuery({
    queryKey: ['student-homework'],
    queryFn: async () => {
      const { data } = await api.get('/homework/student/me');
      return data.data as (HomeworkItem & {
        submissions: { status: string; submittedAt: string | null; grade: string | null; feedback: string | null }[];
      })[];
    },
  });
};

export const useSubmitHomework = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ homeworkId, fileUrl, remarks }: { homeworkId: string; fileUrl?: string; remarks?: string }) => {
      const { data } = await api.post(`/homework/${homeworkId}/submit`, { fileUrl, remarks });
      return data.data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-homework'] }); },
  });
};
