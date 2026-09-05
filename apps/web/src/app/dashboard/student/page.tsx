'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';
import NotificationBell from '@/components/notifications/NotificationBell';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/i18n/context';
import { useFees } from '@/hooks/useFees';

interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  class: {
    name: string;
    subjects: {
      id: string;
      name: string;
      code: string;
      teacher?: { name: string } | null;
    }[];
  };
  section: { name: string };
}

export default function StudentDashboardOverview() {
  const { logout } = useAuth();
  const { t } = useI18n();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentWorkspace = async () => {
      try {
        const response = await api.get('/students/me/profile');
        setProfile(response.data.data);
      } catch (err) {
        console.error('Failed to pull student instance logs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentWorkspace();
  }, []);

  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        
        {/* Workspace AppBar Header Layout Container */}
        <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎓</span>
            <div>
              <h1 className="text-lg font-bold text-white">{t('nav.dashboard', 'Student Hub')}</h1>
              <p className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase font-bold">{t('common.appName', 'Academic Session')} Active</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <NotificationBell />
            <button 
              onClick={logout}
              className="bg-slate-950 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-xs px-4 py-2 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Central Student Desktop View Workspace Layout */}
        <main className="flex-1 p-8 max-w-5xl w-full mx-auto space-y-6">
          
          {loading ? (
            <div className="text-center py-24 text-xs font-mono text-emerald-400 tracking-widest">STREAMING ENROLLED PROFILE ARRAYS...</div>
          ) : !profile ? (
            <div className="text-center text-slate-500 py-12">Failed to resolve active profile bounds.</div>
          ) : (
            <>
              {/* Dynamic Identity Welcome Header Module */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome, {profile.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Keep track of your classes, curriculum schedules, and coursework progress.</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 font-mono text-xs flex gap-4 text-slate-400 shrink-0 shadow-inner">
                  <p><span className="text-emerald-400 font-bold">Roll No:</span> {profile.rollNumber}</p>
                  <p><span className="text-emerald-400 font-bold">Class Allocation:</span> {profile.class.name} — {profile.section.name}</p>
                </div>
              </div>

              {/* Fee Status Overview Widget */}
              <StudentFeeWidget />

              {/* Course Roster Dynamic Catalog Sub-Grid Grid System Layout */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">Your Active Curriculum Courses</h3>
                
                {profile.class.subjects.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-sm text-slate-600 italic">
                    No learning course subject components mapped to your current classroom tracking node.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {profile.class.subjects.map((sub) => (
                      <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg hover:border-slate-700 transition flex flex-col justify-between min-h-[130px]">
                        <div>
                          <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded uppercase">
                            {sub.code}
                          </span>
                          <h4 className="text-base font-bold text-white mt-2 tracking-tight">{sub.name}</h4>
                        </div>
                        <div className="border-t border-slate-800/60 pt-2.5 mt-4 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Lead Instructor:</span>
                          <span className="text-slate-300 font-medium truncate max-w-[140px]">
                            {sub.teacher?.name || 'Staff Assignment Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="space-y-4 pt-6 border-t border-slate-800/60">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/dashboard/student/timetable" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col items-center justify-center hover:border-emerald-500/40 transition group cursor-pointer">
                <span className="text-3xl mb-2 group-hover:scale-110 transition">📅</span>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400">My Timetable</h4>
              </Link>
              <Link href="/dashboard/student/attendance" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col items-center justify-center hover:border-emerald-500/40 transition group cursor-pointer">
                <span className="text-3xl mb-2 group-hover:scale-110 transition">✅</span>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400">My Attendance</h4>
              </Link>
              <Link href="/dashboard/student/results" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col items-center justify-center hover:border-emerald-500/40 transition group cursor-pointer">
                <span className="text-3xl mb-2 group-hover:scale-110 transition">📝</span>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400">My Results</h4>
              </Link>
              <Link href="/dashboard/student/fees" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col items-center justify-center hover:border-emerald-500/40 transition group cursor-pointer">
                <span className="text-3xl mb-2 group-hover:scale-110 transition">💰</span>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400">My Fees</h4>
              </Link>
              <Link href="/dashboard/student/library" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col items-center justify-center hover:border-emerald-500/40 transition group cursor-pointer">
                <span className="text-3xl mb-2 group-hover:scale-110 transition">📖</span>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400">Library</h4>
              </Link>
              <Link href="/dashboard/student/homework" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col items-center justify-center hover:border-emerald-500/40 transition group cursor-pointer">
                <span className="text-3xl mb-2 group-hover:scale-110 transition">📋</span>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400">Homework</h4>
              </Link>
            </div>
          </div>

        </main>
      </div>
    </RoleGuard>
  );
}

function StudentFeeWidget() {
  const { data: fees, isLoading } = useFees();

  if (isLoading || !fees) return null;

  const unpaid = fees.filter(f => f.status !== 'PAID' && f.status !== 'WAIVED');
  const overdue = unpaid.filter(f => f.daysOverdue > 0);
  const totalDue = unpaid.reduce((sum, f) => sum + (f.effectiveAmount - f.paidAmount), 0);
  const paidFees = fees.filter(f => f.status === 'PAID');
  const totalPaid = paidFees.reduce((sum, f) => sum + f.amount, 0);
  const grandTotal = fees.reduce((sum, f) => sum + f.amount, 0);
  const progressPct = grandTotal > 0 ? Math.round((totalPaid / grandTotal) * 100) : 0;

  if (unpaid.length === 0 && paidFees.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <span>💰</span> Fee Status
        </h3>
        <Link href="/dashboard/student/fees" className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
          View Details →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Due</p>
          <p className="text-lg font-extrabold text-amber-400 font-mono mt-0.5">₹{totalDue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Overdue</p>
          <p className="text-lg font-extrabold text-rose-400 font-mono mt-0.5">{overdue.length}</p>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Unpaid Items</p>
          <p className="text-lg font-extrabold text-slate-200 font-mono mt-0.5">{unpaid.length}</p>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Payment Progress</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-lg font-extrabold text-emerald-400 font-mono">{progressPct}%</span>
          </div>
        </div>
      </div>
      {unpaid.length > 0 && (
        <div className="mt-3 flex items-center justify-end">
          <Link
            href="/dashboard/student/fees"
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5"
          >
            Pay Outstanding Fees →
          </Link>
        </div>
      )}
    </div>
  );
}
