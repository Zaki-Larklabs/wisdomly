'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, Download, Loader2, TrendingUp, Users, BookOpen, DollarSign, ClipboardList } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/analytics/export/csv`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-slate-500" />
    </div>
  );

  const overviewCards = data ? [
    { label: 'Students', value: data.overview.totalStudents, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Teachers', value: data.overview.totalTeachers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Staff', value: data.overview.totalStaff, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Classes', value: data.overview.totalClasses, icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Subjects', value: data.overview.totalSubjects, icon: BookOpen, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Attendance Today', value: data.overview.attendanceToday, icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Pending Fees', value: `₹${(data.overview.pendingFees || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Collected Fees', value: `₹${(data.overview.totalFeesCollected || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Pending Leaves', value: data.overview.pendingLeaves, icon: ClipboardList, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Books', value: data.overview.totalBooks, icon: BookOpen, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Borrowed Books', value: data.overview.borrowedBooks, icon: BookOpen, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Homework (7d)', value: data.overview.homeworkThisWeek, icon: ClipboardList, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BarChart3 size={20} className="text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Analytics Dashboard</h1>
          </div>
          <button onClick={handleExport}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition">
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {overviewCards.map(card => (
            <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{card.label}</p>
              <p className={`text-lg font-bold font-mono mt-1 ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Fee Collection Trend */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-4">Monthly Fee Collection</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data?.monthlyFeeCollection || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: any) => [`₹${value?.toLocaleString?.('en-IN') || value}`, 'Collected']}
                />
                <Bar dataKey="collected" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance Trend */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-4">Attendance Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data?.attendanceTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="present" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Fee Status Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-4">Fee Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data?.feeStatusBreakdown || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry: any) => `${entry.status}: ${entry.count}`}
                >
                  {(data?.feeStatusBreakdown || []).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Payments */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-4">Recent Payments</h3>
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {data?.recentPayments?.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-2 px-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div>
                    <p className="text-xs text-white font-medium">{p.student?.name || 'Unknown'}</p>
                    <p className="text-[9px] text-slate-500">{p.feeType} · {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : ''}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">₹{p.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              {(!data?.recentPayments || data.recentPayments.length === 0) && (
                <p className="text-xs text-slate-500 text-center py-4">No recent payments</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
