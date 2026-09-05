'use client';

import React, { useEffect, useState } from 'react';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';
import { api } from '@/lib/api';
import { Calendar, Plus, Loader2, X, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const statusBadge: Record<string, { color: string; icon: React.ReactNode }> = {
  PENDING: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <Clock size={12} /> },
  APPROVED: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle size={12} /> },
  REJECTED: { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: <XCircle size={12} /> },
  CANCELLED: { color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: <AlertCircle size={12} /> },
};

export default function TeacherLeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ leaveType: 'SICK', startDate: '', endDate: '', reason: '' });

  const fetchLeaves = () => {
    api.get('/leaves/me').then(r => setLeaves(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/leaves', form);
      setShowCreate(false);
      setForm({ leaveType: 'SICK', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch {}
  };

  return (
    <RoleGuard allowedRoles={['TEACHER']}>
      <div className="min-h-screen bg-slate-950 text-white">
        <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-emerald-400" />
            <h1 className="text-lg font-bold text-white">My Leave Requests</h1>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition">
            <Plus size={14} /> New Request
          </button>
        </header>

        <main className="p-8 max-w-4xl mx-auto space-y-3">
          {loading ? (
            <div className="text-center py-24"><Loader2 size={24} className="animate-spin mx-auto text-slate-500" /></div>
          ) : leaves.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <Calendar size={40} className="mx-auto text-slate-700 mb-3" />
              <p className="text-slate-400 font-medium">No leave requests</p>
              <p className="text-xs text-slate-600 mt-1">Submit a leave request to get started.</p>
            </div>
          ) : (
            leaves.map(l => {
              const badge = statusBadge[l.status] || statusBadge.PENDING;
              return (
                <div key={l.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    l.leaveType === 'SICK' ? 'bg-rose-500/10 text-rose-400' :
                    l.leaveType === 'EMERGENCY' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>{l.leaveType[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white capitalize">{l.leaveType.toLowerCase()} Leave</p>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                        {badge.icon} {l.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{l.reason}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1.5">
                      <span>{new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}</span>
                      {l.reviewer && <span>Reviewer: {l.reviewer.name}</span>}
                      {l.reviewNote && <span className="italic">"{l.reviewNote}"</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </main>

        {showCreate && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">New Leave Request</h2>
                <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"><X size={18} /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Leave Type</label>
                  <select value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none">
                    <option value="SICK">Sick Leave</option>
                    <option value="PERSONAL">Personal Leave</option>
                    <option value="EMERGENCY">Emergency Leave</option>
                    <option value="ANNUAL">Annual Leave</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Start Date</label>
                    <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">End Date</label>
                    <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Reason</label>
                  <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required rows={3}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none resize-none" />
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-sm transition">
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
