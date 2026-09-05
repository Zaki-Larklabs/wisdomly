'use client';

import React, { useState } from 'react';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';
import { useStudentHomework, useSubmitHomework } from '@/hooks/useHomework';
import { FileText, Loader2, Clock, CheckCircle, AlertTriangle, Award, Upload, X } from 'lucide-react';

const statusBadge: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  SUBMITTED: { label: 'Submitted', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  LATE_SUBMITTED: { label: 'Late', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  GRADED: { label: 'Graded', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

export default function StudentHomeworkPage() {
  const { data: homework, isLoading } = useStudentHomework();
  const submitMutation = useSubmitHomework();
  const [submitId, setSubmitId] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [remarks, setRemarks] = useState('');

  const handleSubmit = async (homeworkId: string) => {
    try {
      await submitMutation.mutateAsync({ homeworkId, fileUrl: fileUrl || undefined, remarks: remarks || undefined });
      setSubmitId(null);
      setFileUrl('');
      setRemarks('');
    } catch {}
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-slate-950 text-white">
        <header className="bg-slate-900 border-b border-slate-800 px-8 py-4">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-emerald-400" />
            <h1 className="text-lg font-bold text-white">My Homework</h1>
          </div>
        </header>

        <main className="p-8 max-w-4xl mx-auto space-y-3">
          {isLoading ? (
            <div className="text-center py-24"><Loader2 size={24} className="animate-spin mx-auto text-slate-500" /></div>
          ) : !homework?.length ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <FileText size={40} className="mx-auto text-slate-700 mb-3" />
              <p className="text-slate-400 font-medium">No homework assigned</p>
              <p className="text-xs text-slate-600 mt-1">Your teachers haven't posted any assignments yet.</p>
            </div>
          ) : (
            homework.map(hw => {
              const sub = hw.submissions?.[0];
              const badge = statusBadge[sub?.status || 'PENDING'];
              const overdue = isOverdue(hw.dueDate) && sub?.status !== 'GRADED';

              return (
                <div key={hw.id} className={`bg-slate-900 border rounded-xl p-5 transition ${
                  overdue ? 'border-amber-500/20' : 'border-slate-800'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{hw.title}</h3>
                        {overdue && <AlertTriangle size={12} className="text-amber-400 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="text-emerald-400 font-mono">{hw.subject.code}</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> Due {new Date(hw.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {sub?.grade && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                          <Award size={12} /> {sub.grade}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.color}`}>{badge.label}</span>
                    </div>
                  </div>

                  {hw.description && (
                    <p className="text-xs text-slate-400 mt-2 whitespace-pre-wrap">{hw.description}</p>
                  )}

                  {sub?.feedback && (
                    <div className="mt-2 text-xs text-slate-500 italic border-l-2 border-slate-700 pl-3">
                      Feedback: {sub.feedback}
                    </div>
                  )}

                  {(sub?.status === 'PENDING' || !sub) && (
                    <div className="mt-3">
                      {submitId === hw.id ? (
                        <div className="space-y-2">
                          <input type="text" value={fileUrl} onChange={e => setFileUrl(e.target.value)}
                            placeholder="File URL (optional)"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none" />
                          <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)}
                            placeholder="Remarks (optional)"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none" />
                          <div className="flex gap-2">
                            <button onClick={() => handleSubmit(hw.id)} disabled={submitMutation.isPending}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-1">
                              {submitMutation.isPending && <Loader2 size={12} className="animate-spin" />}
                              Submit
                            </button>
                            <button onClick={() => setSubmitId(null)} className="text-xs text-slate-500 hover:text-slate-300">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setSubmitId(hw.id)}
                          className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition">
                          <Upload size={12} /> Submit Assignment
                        </button>
                      )}
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
