'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';
import { useTeacherHomework, useCreateHomework } from '@/hooks/useHomework';
import { Plus, Loader2, Clock, FileText, Users, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';

interface TeacherAssignment {
  id: string;
  name: string;
  code: string;
  class: { id: string; name: string };
}

export default function TeacherHomeworkPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [form, setForm] = useState({ classId: '', subjectId: '', title: '', description: '', dueDate: '' });
  const { data, isLoading } = useTeacherHomework();
  const createMutation = useCreateHomework();

  useEffect(() => {
    api.get('/teachers/me/assignments').then(r => setAssignments(r.data.data)).catch(() => {});
  }, []);

  const subjects = form.classId
    ? assignments.filter(a => a.class.id === form.classId)
    : [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(form);
      setShowCreate(false);
      setForm({ classId: '', subjectId: '', title: '', description: '', dueDate: '' });
    } catch {}
  };

  const statusColor = (total: number) => {
    if (total === 0) return 'text-slate-500';
    const now = new Date();
    const item = data?.items?.find(i => i._count?.submissions === total);
    return 'text-emerald-400';
  };

  return (
    <RoleGuard allowedRoles={['TEACHER']}>
      <div className="min-h-screen bg-slate-950 text-white">
        <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-emerald-400" />
            <h1 className="text-lg font-bold text-white">Homework Manager</h1>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition">
            <Plus size={14} /> New Assignment
          </button>
        </header>

        <main className="p-8 max-w-5xl mx-auto space-y-4">
          {isLoading ? (
            <div className="text-center py-24"><Loader2 size={24} className="animate-spin mx-auto text-slate-500" /></div>
          ) : !data?.items?.length ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <FileText size={40} className="mx-auto text-slate-700 mb-3" />
              <p className="text-slate-400 font-medium">No homework assignments yet</p>
              <p className="text-xs text-slate-600 mt-1">Create your first assignment to get started.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {data.items.map(hw => (
                <Link key={hw.id} href={`/dashboard/teacher/homework/${hw.id}`}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/30 transition flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white group-hover:text-emerald-400 transition">{hw.title}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="text-emerald-400 font-mono">{hw.subject.code}</span>
                      <span>{hw.class.name}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {new Date(hw.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <span className="flex items-center gap-1 text-slate-400"><Users size={12} /> {hw._count?.submissions || 0}</span>
                    <span className="text-emerald-400 group-hover:translate-x-1 transition">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>

        {showCreate && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">New Assignment</h2>
                <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"><X size={18} /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Class</label>
                  <select value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value, subjectId: '' })}
                    required className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none">
                    <option value="">Select class</option>
                    {Array.from(new Map(assignments.map(a => [a.class.id, a.class])).values()).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Subject</label>
                  <select value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}
                    required className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none">
                    <option value="">Select subject</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Title</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <button type="submit" disabled={createMutation.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {createMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  Create Assignment
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
