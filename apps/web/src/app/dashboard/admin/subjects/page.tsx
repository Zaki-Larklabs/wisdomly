'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';
import { RoleGuard } from '../../../../components/ui/layouts/RoleGuard';

interface SubjectRecord {
  id: string;
  name: string;
  code: string;
  class: { name: string };
  teacher?: { name: string; department: string } | null;
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({ name: '', code: '', classId: '', teacherId: '' });

  const loadDependencies = async () => {
    try {
      const [subjectsRes, classesRes, teachersRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/classes'),
        api.get('/teachers'),
      ]);
      setSubjects(subjectsRes.data.data);
      setClasses(classesRes.data.data);
      setTeachers(teachersRes.data.data);
    } catch (err) {
      console.error('Failed to compile relational dependencies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDependencies(); }, []);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const payload = { ...formData, teacherId: formData.teacherId || undefined };
      await api.post('/subjects', payload);
      setSuccess(`🎉 Successfully registered ${formData.name} Course!`);
      setFormData({ name: '', code: '', classId: '', teacherId: '' });
      loadDependencies(); // Re-hydrate listing arrays
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Transaction rejected');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div>
            <h1 className="text-3xl font-bold text-emerald-400">Course Management</h1>
            <p className="text-slate-400 text-sm">Define corporate syllabus directories and assign primary instructors.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Subject Entry Action Box Container */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-semibold text-slate-200">Register New Course</h2>
              
              {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg">{error}</div>}
              {success && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-lg">{success}</div>}

              <form onSubmit={handleCreateSubject} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Course Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Organic Chemistry"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="CHEM-102"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Target Class Allocation</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                    required
                  >
                    <option value="">Select Grade Level...</option>
                    {classes.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Lead Assigned Instructor (Optional)</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                  >
                    <option value="">Leave Unassigned...</option>
                    {teachers.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                  </select>
                </div>

                <button type="submit" disabled={submitting} className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2.5 rounded-lg transition disabled:opacity-50 mt-2">
                  {submitting ? 'Linking Systems...' : 'Instantiate Subject'}
                </button>
              </form>
            </div>

            {/* Live Courses Matrix Listing Array */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
              <div className="p-5 border-b border-slate-800 bg-slate-900/50">
                <h2 className="text-lg font-semibold text-slate-200">Institutional Curriculum Directory</h2>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-emerald-400 tracking-widest font-mono">CALCULATING DEPENDENCY MATRIX TREE...</div>
              ) : subjects.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-600">No active subject catalogs configured.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-[10px] uppercase text-slate-500 tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-3">Course / Code</th>
                        <th className="px-6 py-3">Allocated Class</th>
                        <th className="px-6 py-3">Assigned Faculty Head</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {subjects.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-800/20 transition">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-white">{sub.name}</div>
                            <div className="text-xs font-mono text-emerald-400 mt-0.5">{sub.code}</div>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <span className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-1 rounded font-medium">
                              {sub.class?.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            {sub.teacher ? (
                              <div>
                                <div className="text-slate-200 font-medium">{sub.teacher.name}</div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{sub.teacher.department}</div>
                              </div>
                            ) : (
                              <span className="text-amber-500/70 border border-amber-500/10 bg-amber-500/5 px-2 py-0.5 rounded text-[10px] font-bold">Unassigned</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </RoleGuard>
  );
}