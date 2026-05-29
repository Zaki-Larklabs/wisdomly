'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';

interface Assignment {
  id: string;
  name: string;
  code: string;
  class: {
    name: string;
    sections: { name: string }[];
  };
}

export default function TeacherDashboardOverview() {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherWorkspace = async () => {
      try {
        const response = await api.get('/teachers/me/assignments');
        setCourses(response.data.data);
      } catch (err) {
        console.error('Failed to resolve teacher schedule parameters', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherWorkspace();
  }, []);

  return (
    <RoleGuard allowedRoles={['TEACHER']}>
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        
        {/* Core Workspace Horizontal Navbar Appbar Header Container */}
        <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-xl">💼</span>
            <div>
              <h1 className="text-lg font-bold text-white">Instructor Workspace</h1>
              <p className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase font-bold">Faculty Portal Active</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="bg-slate-950 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-xs px-4 py-2 rounded-lg transition"
          >
            Sign Out
          </button>
        </header>

        {/* Central Dashboard Workspace Window Grid View */}
        <main className="flex-1 p-8 max-w-5xl w-full mx-auto space-y-6">
          
          <div className="bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back, Faculty Member</h2>
            <p className="text-sm text-slate-400">Authenticated account profile parameters: <span className="text-emerald-400 font-mono">{user?.email}</span></p>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-semibold tracking-wide text-slate-400 uppercase">Your Active Teaching Schedule</h3>

            {loading ? (
              <div className="text-center py-12 text-xs font-mono text-emerald-400 tracking-widest">STREAMING PERSONAL ASSIGNMENTS ARRAY...</div>
            ) : courses.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-sm text-slate-500">
                You are not currently assigned as a primary course head to any active classes. Contact system admin for directory binding.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold text-white">{course.name}</h4>
                        <p className="text-xs font-mono text-emerald-400 mt-0.5">{course.code}</p>
                      </div>
                      <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-md">
                        {course.class.name}
                      </span>
                    </div>

                    <div className="border-t border-slate-800/60 pt-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Assigned Sub-sections:</span>
                      <div className="flex gap-1 text-xs font-mono font-bold">
                        {course.class.sections.map((s, idx) => (
                          <span key={idx} className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-800/60">
            <h3 className="text-base font-semibold tracking-wide text-slate-400 uppercase">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/dashboard/teacher/timetable" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col items-center justify-center hover:border-emerald-500/40 transition group cursor-pointer">
                <span className="text-3xl mb-2 group-hover:scale-110 transition">📅</span>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400">My Timetable</h4>
              </Link>
              <Link href="/dashboard/teacher/attendance" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col items-center justify-center hover:border-emerald-500/40 transition group cursor-pointer">
                <span className="text-3xl mb-2 group-hover:scale-110 transition">✅</span>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400">Mark Attendance</h4>
              </Link>
              <Link href="/dashboard/teacher/marks" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col items-center justify-center hover:border-emerald-500/40 transition group cursor-pointer">
                <span className="text-3xl mb-2 group-hover:scale-110 transition">📝</span>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400">Enter Marks</h4>
              </Link>
            </div>
          </div>

        </main>
      </div>
    </RoleGuard>
  );
}
