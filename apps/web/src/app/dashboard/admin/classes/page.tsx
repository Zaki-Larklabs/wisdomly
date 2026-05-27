'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';
import { RoleGuard } from '../../../../components/ui/layouts/RoleGuard';

interface ClassRecord {
  id: string;
  name: string;
  gradeLevel: number;
  sections: { id: string; name: string }[];
  _count: { students: number };
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Separate tracking states for both form configurations
  const [classForm, setClassForm] = useState({ name: '', gradeLevel: '' });
  const [sectionForm, setSectionForm] = useState({ name: '', classId: '' });

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data.data);
    } catch (err) {
      console.error('Failed to resolve layout schema elements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/classes', {
        name: classForm.name,
        gradeLevel: parseInt(classForm.gradeLevel, 10),
      });
      setSuccess(`🎉 Successfully deployed ${classForm.name}!`);
      setClassForm({ name: '', gradeLevel: '' });
      fetchClasses();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Transaction rejected');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm.classId) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/classes/sections', sectionForm);
      setSuccess(`🎉 Successfully appended Section ${sectionForm.name} to target branch.`);
      setSectionForm({ name: '', classId: '' });
      fetchClasses();
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
            <h1 className="text-3xl font-bold text-emerald-400">Academic Structure</h1>
            <p className="text-slate-400 text-sm">Configure institutional grade levels, tracks, and section splits.</p>
          </div>

          {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg max-w-sm">{error}</div>}
          {success && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-lg max-w-sm">{success}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Split Operations Control Column Stack */}
            <div className="space-y-6">
              
              {/* Form 1: Deploy New Grade */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Initialize New Grade</h2>
                <form onSubmit={handleCreateClass} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Class 11"
                    value={classForm.name}
                    onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Grade Level Integer (e.g., 11)"
                    value={classForm.gradeLevel}
                    onChange={(e) => setClassForm({ ...classForm, gradeLevel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button type="submit" disabled={submitting} className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[11px] font-bold py-2 rounded-lg transition disabled:opacity-50">
                    Deploy Grade Level
                  </button>
                </form>
              </div>

              {/* Form 2: Append Section Branch Channel */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Map Section Branch</h2>
                <form onSubmit={handleCreateSection} className="space-y-3">
                  <select
                    value={sectionForm.classId}
                    onChange={(e) => setSectionForm({ ...sectionForm, classId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
                    required
                  >
                    <option value="">Select Target Grade...</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Section Identifier Label (e.g., B)"
                    value={sectionForm.name}
                    onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button type="submit" disabled={submitting} className="w-full bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-bold py-2 rounded-lg transition disabled:opacity-50">
                    Bind Section Channel
                  </button>
                </form>
              </div>

            </div>

            {/* Configured Classes Grid Interactive Layout Output Display */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
                <h2 className="text-base font-semibold text-slate-200">Active Structural Nodes</h2>
              </div>

              {loading ? (
                <div className="text-center p-8 text-xs text-emerald-400 font-mono tracking-widest">MAP-REDUCING ARCHITECTURE ARRAYS...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classes.map((cls) => (
                    <div key={cls.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-4 hover:border-slate-700 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-white">{cls.name}</h3>
                          <p className="text-xs text-slate-500 font-medium">Hierarchy Layer Rating: Level {cls.gradeLevel}</p>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-1 rounded font-bold font-mono">
                          {cls._count.students} Students
                        </span>
                      </div>

                      <div className="border-t border-slate-800/80 pt-3">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Connected Sections</span>
                        <div className="flex flex-wrap gap-1.5">
                          {cls.sections.length === 0 ? (
                            <span className="text-xs text-slate-600 italic">No section channels mapped to this layer.</span>
                          ) : (
                            cls.sections.map((sec) => (
                              <span key={sec.id} className="bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded text-xs font-mono font-bold">
                                Section {sec.name}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </RoleGuard>
  );
}