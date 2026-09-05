'use client';

import React, { useEffect, useState } from 'react';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';
import { api } from '@/lib/api';
import { TrendingUp, BookOpen, Award, Loader2, BarChart3 } from 'lucide-react';

export default function StudentProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/progress/my-progress').then(r => setData(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-slate-500" /></div>
    </RoleGuard>
  );

  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <BarChart3 size={20} className="text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Academic Progress</h1>
          </div>

          {!data ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">No progress data available.</div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Overall Average', value: `${data.overallAverage}%`, color: 'text-emerald-400', icon: TrendingUp },
                  { label: 'Exams Taken', value: data.totalExams, color: 'text-blue-400', icon: BookOpen },
                  { label: 'Best Exam', value: data.bestExam?.exam?.name || 'N/A', color: 'text-amber-400', icon: Award },
                  { label: 'Subjects', value: data.subjectPerformance?.length || 0, color: 'text-purple-400', icon: BookOpen },
                ].map(s => (
                  <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-1 text-xs text-slate-500">{s.label}</div>
                    <p className={`text-xl font-bold ${s.color} truncate`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Subject Performance */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-sm font-bold text-slate-300 mb-4">Subject Performance</h2>
                <div className="space-y-3">
                  {data.subjectPerformance?.map((s: any) => (
                    <div key={s.code}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">{s.name} <span className="text-slate-500 font-mono">({s.code})</span></span>
                        <span className={`font-bold ${s.average >= 60 ? 'text-emerald-400' : s.average >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>{s.average}%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${s.average >= 60 ? 'bg-emerald-500' : s.average >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(s.average, 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5">{s.examsCount} exam(s)</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exam History */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-sm font-bold text-slate-300 mb-4">Exam History</h2>
                <div className="space-y-2">
                  {data.reportCards?.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between bg-slate-950/50 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-white">{r.exam?.name || 'Exam'}</p>
                        <p className="text-[10px] text-slate-500">{new Date(r.generatedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold font-mono ${r.percentage >= 60 ? 'text-emerald-400' : r.percentage >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {r.percentage.toFixed(1)}%
                        </span>
                        {r.grade && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">{r.grade}</span>}
                        {r.rank && <span className="text-[10px] text-slate-500">#{r.rank}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
