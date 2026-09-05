'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';
import { useHomeworkDetail, useGradeSubmission } from '@/hooks/useHomework';
import { ArrowLeft, Loader2, Clock, CheckCircle, XCircle, AlertTriangle, Award, MessageSquare } from 'lucide-react';

const statusIcon: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  PENDING: { icon: <Clock size={14} />, color: 'text-slate-400 bg-slate-500/10', label: 'Pending' },
  SUBMITTED: { icon: <CheckCircle size={14} />, color: 'text-blue-400 bg-blue-500/10', label: 'Submitted' },
  LATE_SUBMITTED: { icon: <AlertTriangle size={14} />, color: 'text-amber-400 bg-amber-500/10', label: 'Late' },
  GRADED: { icon: <Award size={14} />, color: 'text-emerald-400 bg-emerald-500/10', label: 'Graded' },
};

export default function HomeworkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: hw, isLoading } = useHomeworkDetail(id);
  const gradeMutation = useGradeSubmission();
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeVal, setGradeVal] = useState('');
  const [feedbackVal, setFeedbackVal] = useState('');

  const handleGrade = async (submissionId: string) => {
    if (!gradeVal) return;
    try {
      await gradeMutation.mutateAsync({ submissionId, grade: gradeVal, feedback: feedbackVal || undefined });
      setGradingId(null);
      setGradeVal('');
      setFeedbackVal('');
    } catch {}
  };

  if (isLoading) return (
    <RoleGuard allowedRoles={['TEACHER']}>
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-slate-500" />
      </div>
    </RoleGuard>
  );

  if (!hw) return (
    <RoleGuard allowedRoles={['TEACHER']}>
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Homework not found</div>
    </RoleGuard>
  );

  const submitted = hw.submissions.filter(s => s.status !== 'PENDING').length;
  const graded = hw.submissions.filter(s => s.status === 'GRADED').length;

  return (
    <RoleGuard allowedRoles={['TEACHER']}>
      <div className="min-h-screen bg-slate-950 text-white">
        <header className="bg-slate-900 border-b border-slate-800 px-8 py-4">
          <Link href="/dashboard/teacher/homework" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition mb-2">
            <ArrowLeft size={14} /> Back to Homework
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{hw.title}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {hw.subject.name} ({hw.subject.code}) — {hw.class.name} — Due {new Date(hw.dueDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="text-slate-400">Total: {hw.submissions.length}</span>
              <span className="text-blue-400">Submitted: {submitted}</span>
              <span className="text-emerald-400">Graded: {graded}</span>
            </div>
          </div>
        </header>

        {hw.description && (
          <div className="px-8 py-4 border-b border-slate-800">
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{hw.description}</p>
          </div>
        )}

        <main className="p-8 max-w-4xl mx-auto space-y-2">
          {hw.submissions.length === 0 ? (
            <div className="text-center py-12 text-slate-600">No students in this class yet.</div>
          ) : (
            hw.submissions.map(sub => {
              const st = statusIcon[sub.status] || statusIcon.PENDING;
              return (
                <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                        {sub.student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{sub.student.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Roll: {sub.student.rollNumber}</p>
                      </div>
                    </div>

                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${st.color}`}>
                      {st.icon} {st.label}
                    </span>

                    {sub.status === 'SUBMITTED' || sub.status === 'LATE_SUBMITTED' ? (
                      gradingId === sub.id ? (
                        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                          <input type="text" value={gradeVal} onChange={e => setGradeVal(e.target.value)}
                            placeholder="Grade" maxLength={10}
                            className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none text-center" />
                          <button onClick={() => handleGrade(sub.id)} disabled={gradeMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                            Save
                          </button>
                          <button onClick={() => setGradingId(null)} className="text-slate-500 hover:text-slate-300 text-[10px]">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { setGradingId(sub.id); setGradeVal(sub.grade || ''); setFeedbackVal(sub.feedback || ''); }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition shrink-0">
                          <Award size={12} /> Grade
                        </button>
                      )
                    ) : sub.status === 'GRADED' ? (
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-bold text-emerald-400 font-mono">{sub.grade}</span>
                        {sub.feedback && (
                          <span className="text-[10px] text-slate-500 italic max-w-[120px] truncate" title={sub.feedback}>
                            "{sub.feedback}"
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {gradingId === sub.id && (
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <textarea value={feedbackVal} onChange={e => setFeedbackVal(e.target.value)}
                        placeholder="Feedback (optional)" rows={2}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none resize-none" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </main>
      </div>
    </RoleGuard>
  );
}
