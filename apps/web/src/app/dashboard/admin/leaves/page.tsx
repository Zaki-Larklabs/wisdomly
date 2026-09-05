'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Calendar, Loader2, CheckCircle, XCircle, Clock, User, Search } from 'lucide-react';

const statusStyle: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  CANCELLED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function AdminLeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchLeaves = () => {
    api.get('/leaves').then(r => setLeaves(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleReview = async (leaveId: string, status: string) => {
    setActionLoading(leaveId);
    try {
      await api.put(`/leaves/${leaveId}/review`, { status, reviewNote: status === 'REJECTED' ? 'Declined by administration' : undefined });
      fetchLeaves();
    } catch {}
    setActionLoading(null);
  };

  const filtered = leaves.filter(l =>
    l.teacher?.name?.toLowerCase().includes(filter.toLowerCase()) ||
    l.leaveType?.toLowerCase().includes(filter.toLowerCase()) ||
    l.status?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Leave Management</h1>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" value={filter} onChange={e => setFilter(e.target.value)}
              placeholder="Search..."
              className="bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white outline-none w-48" />
          </div>
        </div>

        <div className="flex gap-2 text-xs">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
            <button key={f} onClick={() => setFilter(f === 'ALL' ? '' : f)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${filter === f || (f === 'ALL' && !filter) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-500 hover:text-white'}`}>
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-24"><Loader2 size={24} className="animate-spin mx-auto text-slate-500" /></div>
        ) : (
          <div className="space-y-3">
            {filtered.map(l => {
              const isPending = l.status === 'PENDING';
              return (
                <div key={l.id} className={`bg-slate-900 border rounded-xl p-4 ${isPending ? 'border-amber-500/20' : 'border-slate-800'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                      l.leaveType === 'SICK' ? 'bg-rose-500/10 text-rose-400' :
                      l.leaveType === 'EMERGENCY' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>{l.leaveType[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-slate-500" />
                        <p className="font-semibold text-white">{l.teacher?.name}</p>
                        <span className="text-[10px] text-slate-500 font-mono">{l.teacher?.employeeId}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle[l.status] || ''}`}>{l.status}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 capitalize">{l.leaveType.toLowerCase()} Leave — {l.reason}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                        <span>{new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()}</span>
                        {l.reviewer && <span>Reviewed by: {l.reviewer.name}</span>}
                        {l.reviewNote && <span className="italic">"{l.reviewNote}"</span>}
                      </div>
                    </div>
                    {isPending && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleReview(l.id, 'APPROVED')} disabled={actionLoading === l.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition disabled:opacity-50">
                          {actionLoading === l.id ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle size={12} />} Approve
                        </button>
                        <button onClick={() => handleReview(l.id, 'REJECTED')} disabled={actionLoading === l.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition disabled:opacity-50">
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-600 text-sm">No leave requests found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
