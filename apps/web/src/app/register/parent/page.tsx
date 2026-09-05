'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Users, ArrowLeft, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function ParentRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [schoolSlug, setSchoolSlug] = useState('');
  const [schoolData, setSchoolData] = useState<any>(null);
  const [loadingSchool, setLoadingSchool] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    studentRollNumbers: '',
  });

  useEffect(() => {
    if (!schoolSlug.trim()) { setSchoolData(null); return; }
    const timer = setTimeout(async () => {
      setLoadingSchool(true);
      try {
        const { data } = await api.get(`/auth/school/${schoolSlug}`);
        setSchoolData(data.data);
        setError('');
      } catch {
        setSchoolData(null);
        setError('School not found. Check the slug.');
      }
      setLoadingSchool(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [schoolSlug]);

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const rollNumbers = form.studentRollNumbers.split(',').map(s => s.trim()).filter(Boolean);
      await api.post('/auth/register/parent', { ...form, schoolSlug, studentRollNumbers: rollNumbers.length > 0 ? rollNumbers : undefined });
      router.push('/register/success?role=parent');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0C0A09] selection:bg-amber-500/30 p-4">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      <div className="relative z-10 w-full max-w-lg mx-auto">
        <div className="rounded-3xl p-8 overflow-hidden" style={{ background: 'rgba(20, 18, 16, 0.65)', backdropFilter: 'blur(40px) saturate(2)', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 mb-6">
            <Link href="/register" className="p-1.5 rounded-lg hover:bg-white/5 transition">
              <ArrowLeft size={18} className="text-white/50" />
            </Link>
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #F59E0B, #F59E0B88)' }}>
              <Sparkles size={16} color="white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white tracking-tight">Parent Registration</p>
              <p className="text-xs text-white/40">Create your parent account</p>
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">School Slug</label>
              <div className="relative">
                <input type="text" value={schoolSlug} onChange={e => setSchoolSlug(e.target.value)}
                  placeholder="e.g. greenvalley" required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-white/20 text-white"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                {loadingSchool && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-white/30" />}
                {schoolData && !loadingSchool && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 text-xs">Found</span>}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">Full Name</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)} required
                placeholder="Jane Doe"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-white/20 text-white"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">Email</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required
                  placeholder="parent@email.com"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-white/20 text-white"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">Phone</label>
                <input type="text" value={form.phone} onChange={e => update('phone', e.target.value)}
                  placeholder="+91..."
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-white/20 text-white"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} required minLength={6}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none placeholder:text-white/20 text-white"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">Link Children (Roll Numbers)</label>
              <input type="text" value={form.studentRollNumbers} onChange={e => update('studentRollNumbers', e.target.value)}
                placeholder="e.g. 10A001, 10A002 (comma-separated)"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-white/20 text-white"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
              <p className="text-[10px] text-white/30 mt-1">Optional. Enter roll numbers of your children to link them.</p>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 bg-amber-600 hover:bg-amber-500 flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Submit for Approval
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-sm text-white/40">Already have an account? <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
