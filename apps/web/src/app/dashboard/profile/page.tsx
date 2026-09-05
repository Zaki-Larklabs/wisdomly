'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { User, Mail, Phone, Lock, Save, Loader2, ArrowLeft, Key, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({ email: '', phone: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [message, setMessage] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'profile' | 'security'>('profile');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setProfile(data.data);
        setEditForm({ email: data.data.email || '', phone: data.data.phone || '' });
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const { data } = await api.patch('/auth/profile', editForm);
      setProfile({ ...profile, ...data.data });
      setMessage('Profile updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Update failed');
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwMessage('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { setPwMessage('Password must be at least 6 characters'); return; }
    setChangingPw(true);
    setPwMessage('');
    try {
      await api.post('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMessage('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwMessage(''), 3000);
    } catch (err: any) {
      setPwMessage(err?.response?.data?.error?.message || 'Password change failed');
    }
    setChangingPw(false);
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-700',
    SUPER_ADMIN: 'bg-rose-100 text-rose-700',
    TEACHER: 'bg-blue-100 text-blue-700',
    STUDENT: 'bg-emerald-100 text-emerald-700',
    PARENT: 'bg-amber-100 text-amber-700',
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-slate-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-white/60 transition text-slate-500">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                {profile?.student?.name?.[0] || profile?.teacher?.name?.[0] || profile?.parent?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold">{profile?.student?.name || profile?.teacher?.name || profile?.parent?.name || user?.email}</h2>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${roleColors[user?.role || ''] || 'bg-white/20 text-white'}`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200">
            <div className="flex">
              <button onClick={() => setTab('profile')} className={`px-6 py-3 text-sm font-medium transition border-b-2 ${tab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <User size={16} className="inline mr-1.5" /> Profile
              </button>
              <button onClick={() => setTab('security')} className={`px-6 py-3 text-sm font-medium transition border-b-2 ${tab === 'security' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <Shield size={16} className="inline mr-1.5" /> Security
              </button>
            </div>
          </div>

          {tab === 'profile' && (
            <div className="p-6">
              {message && <div className="mb-4 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-1"><Save size={12} /> {message}</div>}
              {error && <div className="mb-4 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5"><Mail size={14} /> Email</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5"><Phone size={14} /> Phone</label>
                  <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 outline-none" />
                </div>
                {profile?.student && (
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Name</span><span className="font-semibold text-slate-900">{profile.student.name}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Roll Number</span><span className="font-semibold text-slate-900">{profile.student.rollNumber}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Class</span><span className="font-semibold text-slate-900">{profile.student.class?.name}</span></div>
                  </div>
                )}
                {profile?.teacher && (
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Name</span><span className="font-semibold text-slate-900">{profile.teacher.name}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Employee ID</span><span className="font-semibold text-slate-900">{profile.teacher.employeeId}</span></div>
                  </div>
                )}
                {profile?.parent && (
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Name</span><span className="font-semibold text-slate-900">{profile.parent.name}</span></div>
                  </div>
                )}
                <button type="submit" disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 text-sm flex items-center justify-center gap-2">
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {tab === 'security' && (
            <div className="p-6">
              {pwMessage && (
                <div className={`mb-4 text-xs rounded-lg px-3 py-2 flex items-center gap-1 ${
                  pwMessage.includes('successfully') ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-700 bg-rose-50 border border-rose-200'
                }`}>
                  <Key size={12} /> {pwMessage}
                </div>
              )}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5"><Lock size={14} /> Current Password</label>
                  <input type="password" required value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5"><Lock size={14} /> New Password</label>
                  <input type="password" required minLength={6} value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5"><Lock size={14} /> Confirm New Password</label>
                  <input type="password" required minLength={6} value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 outline-none" />
                </div>
                <button type="submit" disabled={changingPw}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 text-sm flex items-center justify-center gap-2">
                  {changingPw && <Loader2 size={16} className="animate-spin" />}
                  Change Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
