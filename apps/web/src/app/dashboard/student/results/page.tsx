'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';
import { Award, TrendingUp, Loader2, BarChart3, BookOpen, X } from 'lucide-react';

interface ReportCard {
  id: string;
  percentage: number;
  grade: string | null;
  rank: number | null;
  totalMarks: number;
  generatedAt: string;
  exam: { id: string; name: string };
}

interface ExamMark {
  id: string;
  marksObtained: number;
  maxMarks: number;
  grade: string | null;
  remarks: string | null;
  subject: { name: string; code: string };
}

export default function StudentResultsPage() {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  const { data: results, isLoading } = useQuery({
    queryKey: ['my-results'],
    queryFn: async () => {
      const { data } = await api.get('/marks/my-results');
      return data.data as ReportCard[];
    },
  });

  const { data: examMarks, isLoading: marksLoading } = useQuery({
    queryKey: ['my-exam-marks', selectedExamId],
    queryFn: async () => {
      if (!selectedExamId) return [];
      const { data } = await api.get(`/marks/my-marks/${selectedExamId}`);
      return data.data as ExamMark[];
    },
    enabled: !!selectedExamId,
  });

  const avgPct = results && results.length > 0
    ? (results.reduce((a, r) => a + r.percentage, 0) / results.length).toFixed(1)
    : null;

  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-slate-950 text-white">
        <header className="bg-slate-900 border-b border-slate-800 px-8 py-4">
          <div className="flex items-center gap-3">
            <BarChart3 size={20} className="text-emerald-400" />
            <h1 className="text-lg font-bold text-white">My Results</h1>
          </div>
        </header>

        <main className="p-8 max-w-5xl mx-auto space-y-6">
          {isLoading ? (
            <div className="text-center py-24"><Loader2 size={24} className="animate-spin mx-auto text-slate-500" /></div>
          ) : !results?.length ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <Award size={40} className="mx-auto text-slate-700 mb-3" />
              <p className="text-slate-400 font-medium">No results published yet</p>
              <p className="text-xs text-slate-600 mt-1">Your exam results will appear here once your teachers publish them.</p>
            </div>
          ) : (
            <>
              {avgPct && (
                <div className="bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp size={22} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Average Performance</p>
                    <p className="text-2xl font-bold text-white">{avgPct}%</p>
                  </div>
                  <div className="flex-1 max-w-xs ml-auto">
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(Number(avgPct), 100)}%` }} />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-3">
                {results.map(r => (
                  <div key={r.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/20 transition cursor-pointer"
                    onClick={() => setSelectedExamId(selectedExamId === r.exam.id ? null : r.exam.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <BookOpen size={18} className="text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{r.exam.name}</h3>
                          <p className="text-xs text-slate-500">{new Date(r.generatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-lg font-bold font-mono ${Number(avgPct) >= 60 ? 'text-emerald-400' : Number(avgPct) >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {r.percentage.toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-center px-3 py-1 rounded-lg bg-slate-800">
                          <p className="text-[10px] text-slate-500">Grade</p>
                          <p className="text-sm font-bold text-white">{r.grade || '-'}</p>
                        </div>
                        <div className="text-center px-3 py-1 rounded-lg bg-slate-800">
                          <p className="text-[10px] text-slate-500">Rank</p>
                          <p className="text-sm font-bold text-white">{r.rank ? `#${r.rank}` : '-'}</p>
                        </div>
                        <div className="text-center px-3 py-1 rounded-lg bg-slate-800">
                          <p className="text-[10px] text-slate-500">Total</p>
                          <p className="text-sm font-bold text-white">{r.totalMarks}</p>
                        </div>
                      </div>
                    </div>

                    {selectedExamId === r.exam.id && (
                      <div className="mt-4 pt-4 border-t border-slate-800">
                        {marksLoading ? (
                          <Loader2 size={16} className="animate-spin mx-auto text-slate-500" />
                        ) : examMarks && examMarks.length > 0 ? (
                          <div className="space-y-2">
                            {examMarks.map(m => (
                              <div key={m.id} className="flex items-center justify-between bg-slate-950/50 rounded-lg px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-emerald-400">{m.subject.code}</span>
                                  <span className="text-sm text-slate-300">{m.subject.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-mono text-white">{m.marksObtained}/{m.maxMarks}</span>
                                  {m.grade && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">{m.grade}</span>}
                                  {m.remarks && <span className="text-[10px] text-slate-500 italic max-w-[120px] truncate">{m.remarks}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600 text-center py-4">No subject breakdown available.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </RoleGuard>
  );
}
