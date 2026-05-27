'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';

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
              <h1 className="text-lg font-bold text-white">Student Hub</h1>
              <p className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase font-bold">Academic Session Active</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="bg-slate-950 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-xs px-4 py-2 rounded-lg transition"
          >
            Sign Out
          </button>
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

        </main>
      </div>
    </RoleGuard>
  );
}
