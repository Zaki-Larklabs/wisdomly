'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, Plus, Search, X, Edit3, Trash2, Loader2 } from 'lucide-react';

const designations = ['Accountant', 'Librarian', 'Clerk', 'Janitor', 'Security', 'Receptionist', 'IT Support', 'Driver', 'Cook', 'Other'];

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ employeeId: '', name: '', designation: '', department: '', phone: '', email: '', salary: 0, address: '' });

  const fetchStaff = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      const r = await api.get('/staff', { params });
      setStaff(r.data.data || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);
  useEffect(() => { fetchStaff(); }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, email: form.email || undefined, salary: form.salary || undefined };
      if (editItem) {
        await api.put(`/staff/${editItem.id}`, payload);
      } else {
        await api.post('/staff', payload);
      }
      setShowModal(false);
      setEditItem(null);
      setForm({ employeeId: '', name: '', designation: '', department: '', phone: '', email: '', salary: 0, address: '' });
      fetchStaff();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this staff member?')) return;
    try {
      await api.delete(`/staff/${id}`);
      fetchStaff();
    } catch {}
  };

  const openEdit = (s: any) => {
    setEditItem(s);
    setForm({ employeeId: s.employeeId, name: s.name, designation: s.designation, department: s.department || '', phone: s.phone || '', email: s.email || '', salary: s.salary || 0, address: s.address || '' });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Staff Management</h1>
          </div>
          <button onClick={() => { setEditItem(null); setForm({ employeeId: '', name: '', designation: '', department: '', phone: '', email: '', salary: 0, address: '' }); setShowModal(true); }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition">
            <Plus size={14} /> Add Staff
          </button>
        </div>

        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID, or designation..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/40" />
        </div>

        {loading ? (
          <div className="text-center py-24"><Loader2 size={24} className="animate-spin mx-auto text-slate-500" /></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map(s => (
              <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition group">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-emerald-400">{s.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{s.name}</p>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{s.designation}</p>
                    {s.department && <p className="text-[10px] text-slate-500">{s.department}</p>}
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <span className="text-[9px] font-mono text-slate-600 bg-slate-800/50 px-2 py-0.5 rounded">ID: {s.employeeId}</span>
                      {s.salary && <span className="text-[9px] font-mono text-slate-600 bg-slate-800/50 px-2 py-0.5 rounded">₹{s.salary.toLocaleString('en-IN')}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-blue-400"><Edit3 size={14} /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400"><Trash2 size={14} /></button>
                  </div>
                </div>
                {(s.phone || s.email) && (
                  <div className="mt-3 pt-3 border-t border-slate-800/50 text-[10px] text-slate-500 space-y-0.5">
                    {s.phone && <p>📞 {s.phone}</p>}
                    {s.email && <p>✉️ {s.email}</p>}
                  </div>
                )}
              </div>
            ))}
            {staff.length === 0 && (
              <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <Users size={40} className="mx-auto text-slate-700 mb-3" />
                <p className="text-slate-400">No staff members found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => { setShowModal(false); setEditItem(null); }}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">{editItem ? 'Edit Staff' : 'Add Staff'}</h2>
              <button onClick={() => { setShowModal(false); setEditItem(null); }} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Employee ID</label>
                  <input type="text" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Designation</label>
                  <select value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none">
                    <option value="">Select...</option>
                    {designations.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Department</label>
                  <input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Phone</label>
                  <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Salary (₹)</label>
                  <input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: parseFloat(e.target.value) || 0 })} min={0}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Address</label>
                  <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-sm transition">
                {editItem ? 'Update Staff' : 'Add Staff'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
