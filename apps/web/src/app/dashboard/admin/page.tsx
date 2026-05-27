'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  systemStatus: string;
}

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data.data);
      } catch (err) {
        console.error('Failed to pull system operational matrix metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400 font-mono text-xs tracking-widest">
        STREAMING INSTANCE METRICS SYSTEM CONFIG...
      </div>
    );
  }

  const metricCards = [
    { title: 'Enrolled Students', count: stats?.totalStudents ?? 0, icon: '🎓', color: 'text-emerald-400' },
    { title: 'Active Faculty', count: stats?.totalTeachers ?? 0, icon: '💼', color: 'text-blue-400' },
    { title: 'Academic Classes', count: stats?.totalClasses ?? 0, icon: '🏫', color: 'text-purple-400' },
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-950 min-h-screen text-white">
      
      {/* Dynamic Identity Welcome Banner Node */}
      <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Control Overview</h1>
          <p className="text-slate-400 text-sm mt-0.5">Real-time status metrics for Green Valley School.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
            Core Engine: {stats?.systemStatus}
          </span>
        </div>
      </div>

      {/* Analytics Metric Cards Grid System Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metricCards.map((card, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex items-center justify-between hover:border-slate-700 transition">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{card.title}</p>
              <p className="text-4xl font-extrabold font-mono tracking-tight text-white">{card.count}</p>
            </div>
            <div className={`text-4xl bg-slate-950 w-14 h-14 rounded-xl flex items-center justify-center border border-slate-800/80 shadow-inner`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Component Board Block */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-slate-200 mb-1">Administrative Quick Actions</h3>
        <p className="text-xs text-slate-500 mb-4">Direct shortcuts to system registry management modules.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <a href="/dashboard/admin/students" className="p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-emerald-500/40 transition group flex justify-between items-center">
            <span>Onboard Students / Bulk Import CSV</span>
            <span className="text-slate-600 group-hover:text-emerald-400 transition">→</span>
          </a>
          <a href="/dashboard/admin/teachers" className="p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-emerald-500/40 transition group flex justify-between items-center">
            <span>Manage Faculty Registers & Departments</span>
            <span className="text-slate-600 group-hover:text-emerald-400 transition">→</span>
          </a>
        </div>
      </div>

    </div>
  );
}