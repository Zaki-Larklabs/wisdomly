'use client';

import React, { useEffect, useState } from 'react';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';
import { api } from '@/lib/api';
import { Loader2, Save, FileSpreadsheet, GraduationCap, BookOpen } from 'lucide-react';

export default function TeacherMarksEntry() {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);

  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<Record<string, { obtained: number; remarks: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    api.get('/classes').then(r => setClasses(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedClass) { setSubjects([]); return; }
    api.get(`/subjects/class/${selectedClass}`).then(r => setSubjects(r.data.data)).catch(() => {});
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedClass) { setExams([]); return; }
    api.get('/exams', { params: { classId: selectedClass, subjectId: selectedSubject || undefined } })
      .then(r => setExams(r.data.data)).catch(() => {});
  }, [selectedClass, selectedSubject]);

  useEffect(() => {
    if (!selectedClass || !selectedSubject || !selectedExam) return;
    setLoading(true);
    api.get('/students', { params: { classId: selectedClass } })
      .then(r => {
        const list = r.data.data?.data || r.data.data || [];
        setStudents(list);
        const initial: Record<string, { obtained: number; remarks: string }> = {};
        list.forEach((s: any) => { initial[s.id] = { obtained: 0, remarks: '' }; });
        setMarks(initial);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedClass, selectedSubject, selectedExam]);

  const handleSave = async () => {
    setSaving(true);
    setStatus('');
    try {
      await api.post('/marks/bulk', {
        examId: selectedExam,
        subjectId: selectedSubject,
        maxMarks: Number(maxMarks),
        marks: Object.entries(marks).map(([studentId, m]) => ({
          studentId,
          marksObtained: Number(m.obtained),
          remarks: m.remarks || undefined,
        })),
      });
      setStatus('Marks saved successfully');
      setTimeout(() => setStatus(''), 3000);
    } catch {
      setStatus('Failed to save marks');
    }
    setSaving(false);
  };

  return (
    <RoleGuard allowedRoles={['TEACHER']}>
      <div className="min-h-screen bg-slate-950 text-white">
        <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileSpreadsheet size={20} className="text-emerald-400" />
            <h1 className="text-lg font-bold text-white">Marks Entry</h1>
          </div>
          <button onClick={handleSave} disabled={!selectedClass || !selectedSubject || !selectedExam || students.length === 0 || saving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-1.5">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Marks
          </button>
        </header>

        <main className="p-8 max-w-6xl mx-auto space-y-6">
          {status && (
            <div className={`text-xs px-4 py-2 rounded-lg ${status.includes('success') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              {status}
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Class</label>
              <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSubject(''); setSelectedExam(''); }}
                className="w-48 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none">
                <option value="">Select class</option>
                {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Subject</label>
              <select value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedExam(''); }}
                disabled={!selectedClass}
                className="w-48 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none disabled:opacity-50">
                <option value="">Select subject</option>
                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Exam</label>
              <select value={selectedExam} onChange={e => {
                setSelectedExam(e.target.value);
                const exam = exams.find((ex: any) => ex.id === e.target.value);
                if (exam) setMaxMarks(exam.maxMarks);
              }} disabled={!selectedSubject}
                className="w-48 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none disabled:opacity-50">
                <option value="">Select exam</option>
                {exams.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Max Marks</label>
              <input type="number" value={maxMarks} onChange={e => setMaxMarks(Number(e.target.value))}
                className="w-32 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16"><Loader2 size={24} className="animate-spin mx-auto text-slate-500" /></div>
          ) : selectedClass && selectedSubject && selectedExam && students.length > 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 w-20">Roll</th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">Student</th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 w-40">Marks</th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-slate-800/30">
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{student.rollNumber}</td>
                      <td className="px-5 py-3.5 font-medium text-white">{student.name}</td>
                      <td className="px-5 py-3.5">
                        <input type="number" min={0} max={maxMarks}
                          value={marks[student.id]?.obtained || 0}
                          onChange={e => setMarks(prev => ({ ...prev, [student.id]: { ...prev[student.id], obtained: Number(e.target.value) } }))}
                          className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-white outline-none" />
                      </td>
                      <td className="px-5 py-3.5">
                        <input type="text" value={marks[student.id]?.remarks || ''}
                          onChange={e => setMarks(prev => ({ ...prev, [student.id]: { ...prev[student.id], remarks: e.target.value } }))}
                          placeholder="Optional"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-white outline-none placeholder:text-slate-600" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedClass ? (
            <div className="text-center py-16 text-slate-600 text-sm border-2 border-dashed border-slate-800 rounded-2xl">
              Complete your selection to view students.
            </div>
          ) : null}
        </main>
      </div>
    </RoleGuard>
  );
}
