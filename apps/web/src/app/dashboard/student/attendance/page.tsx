'use client';

import React, { useEffect, useState } from 'react';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';
import { api } from '@/lib/api';
import { CalendarDays, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function StudentAttendancePage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/attendance/my-attendance', { params: { month, year } })
      .then(r => setRecords(r.data.data || []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [month, year]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const recordMap = new Map(records.map(r => [new Date(r.date).getDate(), r]));

  const present = records.filter(r => r.status === 'PRESENT').length;
  const absent = records.filter(r => r.status === 'ABSENT').length;
  const late = records.filter(r => r.status === 'LATE').length;
  const leave = records.filter(r => r.status === 'LEAVE').length;
  const total = records.length || 1;
  const pct = Math.round((present / total) * 100);

  const statusColor: Record<string, string> = {
    PRESENT: 'bg-emerald-500 text-white',
    ABSENT: 'bg-rose-500 text-white',
    LATE: 'bg-amber-500 text-white',
    LEAVE: 'bg-blue-500 text-white',
  };

  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <CalendarDays size={20} className="text-emerald-400" />
            <h1 className="text-xl font-bold text-white">My Attendance</h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-emerald-400">{pct}%</p>
              <p className="text-[10px] text-slate-500">Overall</p>
            </div>
            {[
              { label: 'Present', value: present, color: 'text-emerald-400', icon: CheckCircle },
              { label: 'Absent', value: absent, color: 'text-rose-400', icon: XCircle },
              { label: 'Late', value: late, color: 'text-amber-400', icon: Clock },
              { label: 'Leave', value: leave, color: 'text-blue-400' },
            ].map(s => (
              <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Month selector */}
          <div className="flex items-center gap-2">
            <button onClick={() => { if (month > 1) setMonth(month - 1); else { setMonth(12); setYear(year - 1); } }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700">←</button>
            <span className="text-sm font-bold text-white min-w-[140px] text-center">{months[month - 1]} {year}</span>
            <button onClick={() => { if (month < 12) setMonth(month + 1); else { setMonth(1); setYear(year + 1); } }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700">→</button>
          </div>

          {/* Calendar */}
          {loading ? (
            <div className="text-center py-12"><Loader2 size={24} className="animate-spin mx-auto text-slate-500" /></div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-7 border-b border-slate-800">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="px-3 py-2 text-[10px] font-semibold text-slate-500 text-center uppercase">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="aspect-square p-1.5" />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const rec = recordMap.get(day);
                  return (
                    <div key={day} className="aspect-square p-1.5 border-b border-r border-slate-800/50">
                      <div className={`h-full rounded-lg flex flex-col items-center justify-center ${rec ? statusColor[rec.status] || '' : ''} ${!rec ? 'hover:bg-slate-800/30' : ''}`}>
                        <span className={`text-sm font-bold ${!rec ? 'text-slate-400' : ''}`}>{day}</span>
                        {rec && <span className="text-[8px] opacity-80 mt-0.5">{rec.status === 'PRESENT' ? 'P' : rec.status === 'ABSENT' ? 'A' : rec.status === 'LATE' ? 'L' : 'LV'}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
