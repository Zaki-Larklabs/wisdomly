'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Loader2, Save, Building2, Globe, Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function SchoolSettingsPage() {
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '', address: '', city: '', state: '', phone: '', email: '', timezone: '',
  });

  useEffect(() => {
    api.get('/schools/profile').then(r => {
      const s = r.data.data;
      setSchool(s);
      setForm({ name: s.name, address: s.address || '', city: s.city || '', state: s.state || '', phone: s.phone || '', email: s.email || '', timezone: s.timezone || 'Asia/Kolkata' });
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const { data } = await api.patch('/schools/profile', form);
      setSchool(data.data);
      setMessage('Settings saved');
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Save failed'); }
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-slate-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Building2 size={20} className="text-emerald-400" />
          <h1 className="text-xl font-bold text-white">School Settings</h1>
        </div>

        {message && (
          <div className={`text-xs px-4 py-2 rounded-lg ${message.includes('failed') ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl">
              {school?.name?.[0] || 'S'}
            </div>
            <div>
              <p className="font-bold text-lg">{school?.name}</p>
              <p className="text-xs text-slate-500 font-mono">Slug: {school?.slug} | Plan: {school?.plan}</p>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1"><Building2 size={12} /> School Name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1"><MapPin size={12} /> Address</label>
              <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1"><MapPin size={12} /> City</label>
              <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1"><MapPin size={12} /> State</label>
              <input type="text" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1"><Phone size={12} /> Phone</label>
              <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1"><Mail size={12} /> Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1"><Clock size={12} /> Timezone</label>
              <input type="text" value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            <Save size={14} /> Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}
