'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CheckCircle, XCircle, Loader2, Clock, UserCheck, UserX, Sparkles } from 'lucide-react';

export default function RegistrationsPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      const { data } = await api.get('/admin/pending-approvals');
      setPending(data.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      await api.put(`/admin/approve-user/${userId}`);
      setPending(p => p.filter(u => u.id !== userId));
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  const handleReject = async (userId: string) => {
    if (!window.confirm('Remove this registration request?')) return;
    setActionLoading(userId);
    try {
      await api.delete(`/admin/reject-user/${userId}`);
      setPending(p => p.filter(u => u.id !== userId));
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-slate-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg bg-emerald-500/20">
            <UserCheck size={20} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Pending Registrations</h1>
            <p className="text-sm text-slate-400">{pending.length} awaiting approval</p>
          </div>
        </div>

        {pending.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <CheckCircle size={40} className="mx-auto text-emerald-500 mb-3" />
            <p className="text-slate-400 font-medium">No pending registrations</p>
            <p className="text-xs text-slate-600 mt-1">All users have been reviewed.</p>
          </div>
        )}

        <div className="space-y-3">
          {pending.map((user: any) => (
            <div key={user.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                user.role === 'STUDENT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {user.role === 'STUDENT' ? 'S' : 'P'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">
                  {user.student?.name || user.parent?.name || 'Unknown'}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span className="uppercase tracking-wider">{user.role}</span>
                  {user.student && (
                    <>
                      <span>Roll: {user.student.rollNumber}</span>
                      <span>{user.student.class?.name} - {user.student.section?.name}</span>
                    </>
                  )}
                  {user.email && <span>{user.email}</span>}
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleApprove(user.id)} disabled={actionLoading === user.id}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition disabled:opacity-50">
                  {actionLoading === user.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={14} />}
                  Approve
                </button>
                <button onClick={() => handleReject(user.id)} disabled={actionLoading === user.id}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition disabled:opacity-50">
                  <XCircle size={14} />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
