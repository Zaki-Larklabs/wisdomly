'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Building2, Users, GraduationCap, Globe, Loader2, Plus, X, Power, Sparkles, LogOut } from 'lucide-react';

export default function SuperAdminPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', plan: 'FREE', address: '', city: '', state: '', phone: '', email: '' });

  const fetchData = async () => {
    try {
      const [statsRes, schoolsRes] = await Promise.all([
        api.get('/super-admin/stats'),
        api.get('/super-admin/schools'),
      ]);
      setStats(statsRes.data.data);
      setSchools(schoolsRes.data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/super-admin/schools', form);
      setShowCreate(false);
      setForm({ name: '', slug: '', plan: 'FREE', address: '', city: '', state: '', phone: '', email: '' });
      fetchData();
    } catch {}
  };

  const handleToggle = async (schoolId: string) => {
    try {
      await api.put(`/super-admin/schools/${schoolId}/toggle`);
      fetchData();
    } catch {}
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-slate-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center">
            <Sparkles size={18} className="text-rose-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Super Admin Console</h1>
            <p className="text-[10px] text-slate-500 font-mono">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition">
          <LogOut size={14} /> Sign Out
        </button>
      </header>

      <main className="p-8 max-w-6xl mx-auto space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Schools', value: stats?.totalSchools || 0, icon: Globe, color: 'text-blue-400 bg-blue-500/10' },
            { label: 'Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-purple-400 bg-purple-500/10' },
            { label: 'Students', value: stats?.totalStudents || 0, icon: GraduationCap, color: 'text-emerald-400 bg-emerald-500/10' },
            { label: 'Teachers', value: stats?.totalTeachers || 0, icon: Building2, color: 'text-amber-400 bg-amber-500/10' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon size={18} />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Schools */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">All Schools</h2>
            <button onClick={() => setShowCreate(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition">
              <Plus size={14} /> Add School
            </button>
          </div>
          <div className="space-y-2">
            {schools.map(s => (
              <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${s.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                  {s.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{s.name}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span className="font-mono">{s.slug}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${s.plan === 'FREE' ? 'text-slate-400 bg-slate-800' : 'text-emerald-400 bg-emerald-500/10'}`}>{s.plan}</span>
                    <span>{s._count?.users || 0} users</span>
                    <span>{s._count?.students || 0} students</span>
                  </div>
                </div>
                <button onClick={() => handleToggle(s.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                    s.isActive ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                  }`}>
                  <Power size={11} /> {s.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
            {schools.length === 0 && (
              <div className="text-center py-12 text-slate-600 text-sm">No schools registered yet.</div>
            )}
          </div>
        </div>
      </main>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Add School</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">School Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Slug</label>
                  <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required
                    placeholder="e.g. greenvalley"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Plan</label>
                  <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none">
                    <option value="FREE">Free</option>
                    <option value="BASIC">Basic</option>
                    <option value="STANDARD">Standard</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Phone</label>
                  <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">City</label>
                  <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">State</label>
                  <input type="text" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-lg text-sm transition">
                Create School
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
