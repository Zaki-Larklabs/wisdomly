'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';
import { RoleGuard } from '../../../../components/ui/layouts/RoleGuard';

interface Teacher {
  id: string;
  name: string;
  department: string;
  joiningDate: string;
  user: {
    email: string;
    phone: string;
    isActive: boolean;
  };
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    password: 'Teacher@1234', // Default placeholder baseline key for onboarding
  });

  // 1. Pull existing faculty registers from the database
  const fetchTeachers = async () => {
    try {
      const response = await api.get('/teachers');
      setTeachers(response.data.data);
    } catch (err) {
      console.error('Failed to resolve faculty registers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // 2. Submit single teacher creation form
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/teachers', formData);
      setSuccess(`🎉 Registered ${formData.name} successfully into system archives.`);
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: '',
        password: 'Teacher@1234',
      });
      fetchTeachers(); // Refresh table state data
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Verification rejected');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div>
            <h1 className="text-3xl font-bold text-emerald-400">Faculty & Instructor Registry</h1>
            <p className="text-slate-400 text-sm">Add individual instructor credentials and manage class assignments.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Inline Creation Form Component Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-semibold text-slate-200">Onboard New Instructor</h2>
              
              {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-lg">{error}</div>}
              {success && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-lg">{success}</div>}

              <form onSubmit={handleCreateTeacher} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Vikram Sarabhai"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Institutional Email</label>
                  <input
                    type="email"
                    required
                    placeholder="vikram@greenvalley.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Department Scope</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                    required
                  >
                    <option value="">Select Domain...</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science & Physics</option>
                    <option value="Humanities">Humanities & Languages</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2.5 rounded-lg transition disabled:opacity-50 mt-2"
                >
                  {submitting ? 'Writing System Logs...' : 'Commit Instructor Profile'}
                </button>
              </form>
            </div>

            {/* Live Synchronized Faculty Table Registry Display Grid */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
              <div className="p-5 border-b border-slate-800 bg-slate-900/50">
                <h2 className="text-lg font-semibold text-slate-200">Active Faculty Directory</h2>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-emerald-400 tracking-widest">RESOLVING DISTRIBUTED ACCOUNTS MATRIX...</div>
              ) : teachers.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-600">No registered instructors mapped to this institutional workspace domain.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-[10px] uppercase text-slate-500 tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-3">Instructor Details</th>
                        <th className="px-6 py-3">Department</th>
                        <th className="px-6 py-3">System Access Node</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {teachers.map((teacher) => (
                        <tr key={teacher.id} className="hover:bg-slate-800/20 transition">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-white">{teacher.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{teacher.user?.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-slate-950 border border-slate-800 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                              {teacher.department}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-slate-500">
                            {teacher.user?.phone || 'N/A'}
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