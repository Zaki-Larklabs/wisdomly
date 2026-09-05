'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ArrowLeft, Loader2, GraduationCap, Calendar, BookOpen, Award } from 'lucide-react';

export default function ChildDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const [results, setResults] = useState<any[]>([]);
  const [homework, setHomework] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<{ present: number; total: number }>({ present: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    Promise.all([
      api.get(`/marks/student/${studentId}`).catch(() => ({ data: { data: [] } })),
      api.get(`/attendance/student/${studentId}`, { params: { month: new Date().getMonth() + 1, year: new Date().getFullYear() } }).catch(() => ({ data: { data: [] } })),
    ]).then(([resultsRes, attRes]) => {
      if (resultsRes.data.success) setResults(resultsRes.data.data);
      if (attRes.data.success) {
        const records = attRes.data.data || [];
        const present = records.filter((r: any) => r.status === 'PRESENT').length;
        setAttendance({ present, total: records.length || 1 });
      }
      setLoading(false);
    });
  }, [studentId]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={24} className="animate-spin text-slate-400" />
    </div>
  );

  const attPct = Math.round((attendance.present / attendance.total) * 100);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <Link href="/dashboard/parent/children" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition">
        <ArrowLeft size={14} /> Back to Children
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Attendance */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-blue-500" />
            <h3 className="font-semibold text-slate-900 text-sm">This Month's Attendance</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="6" fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - attPct / 100)}`}
                  className={`${attPct >= 75 ? 'text-emerald-500' : 'text-amber-500'} transition-all duration-1000`} />
              </svg>
              <span className="absolute text-sm font-bold text-slate-800">{attPct}%</span>
            </div>
            <div className="text-xs text-slate-500">
              <p><span className="font-semibold text-slate-800">{attendance.present}</span> Present</p>
              <p><span className="font-semibold text-slate-800">{attendance.total - attendance.present}</span> Missed</p>
            </div>
          </div>
        </div>

        {/* Latest Result */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Award size={16} className="text-emerald-500" />
            <h3 className="font-semibold text-slate-900 text-sm">Latest Exam</h3>
          </div>
          {results.length > 0 ? (
            <>
              <p className="text-xs text-slate-500">{results[0].exam?.name}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{results[0].percentage.toFixed(1)}%</p>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${results[0].percentage}%` }} />
              </div>
              <div className="flex gap-3 mt-2 text-xs text-slate-500">
                {results[0].grade && <span>Grade: <strong className="text-slate-800">{results[0].grade}</strong></span>}
                {results[0].rank && <span>Rank: <strong className="text-slate-800">#{results[0].rank}</strong></span>}
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400 italic">No results published yet.</p>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link href={`/dashboard/parent/fees`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-amber-600 hover:bg-amber-50 px-3 py-2 rounded-lg transition">
              <span>💰</span> View Fees
            </Link>
            <Link href={`/dashboard/parent/children/${studentId}/timetable`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-amber-600 hover:bg-amber-50 px-3 py-2 rounded-lg transition">
              <span>📅</span> View Timetable
            </Link>
          </div>
        </div>
      </div>

      {/* Academic History */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-900">Academic History</h3>
        </div>
        {results.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase text-slate-500">Exam</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase text-slate-500">Date</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase text-slate-500">Score</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase text-slate-500">Grade</th>
                <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase text-slate-500">Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{r.exam?.name || 'Exam'}</td>
                  <td className="px-5 py-3 text-slate-500">{new Date(r.generatedAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 font-bold text-slate-900">{r.percentage.toFixed(1)}%</td>
                  <td className="px-5 py-3"><span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">{r.grade || '-'}</span></td>
                  <td className="px-5 py-3 text-right text-slate-500">{r.rank ? `#${r.rank}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-sm text-slate-400">No academic history available.</div>
        )}
      </div>
    </div>
  );
}
