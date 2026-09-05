'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { GraduationCap, ArrowLeft, Loader2, Eye, EyeOff, Sparkles, ChevronDown } from 'lucide-react';

export default function StudentRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [schoolSlug, setSchoolSlug] = useState('');
  const [schoolData, setSchoolData] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loadingSchool, setLoadingSchool] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    rollNumber: '', classId: '', sectionId: '',
    dob: '', gender: '', address: '', parentPhone: '',
  });

  useEffect(() => {
    if (!schoolSlug.trim()) { setSchoolData(null); setClasses([]); setSections([]); return; }
    const timer = setTimeout(async () => {
      setLoadingSchool(true);
      try {
        const { data } = await api.get(`/auth/school/${schoolSlug}`);
        const school = data.data;
        setSchoolData(school);
        setClasses(school.classes || []);
        setSections([]);
        setForm(f => ({ ...f, classId: '', sectionId: '' }));
        setError('');
      } catch {
        setSchoolData(null);
        setClasses([]);
        setSections([]);
        setError('School not found. Check the slug.');
      }
      setLoadingSchool(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [schoolSlug]);

  useEffect(() => {
    if (form.classId && schoolData) {
      const cls = schoolData.classes?.find((c: any) => c.id === form.classId);
      setSections(cls?.sections || []);
      setForm(f => ({ ...f, sectionId: '' }));
    } else {
      setSections([]);
    }
  }, [form.classId, schoolData]);

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register/student', { ...form, schoolSlug });
      router.push('/register/success?role=student');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0C0A09] selection:bg-emerald-500/30 p-4">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      <div className="relative z-10 w-full max-w-lg mx-auto">
        <div className="rounded-3xl p-8 overflow-hidden" style={{ background: 'rgba(20, 18, 16, 0.65)', backdropFilter: 'blur(40px) saturate(2)', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 mb-6">
            <Link href="/register" className="p-1.5 rounded-lg hover:bg-white/5 transition">
              <ArrowLeft size={18} className="text-white/50" />
            </Link>
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #10B981, #10B98188)' }}>
              <Sparkles size={16} color="white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white tracking-tight">Student Registration</p>
              <p className="text-xs text-white/40">Create your student account</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-white/10'}`} />
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-white/10'}`} />
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">School Slug</label>
                  <div className="relative">
                    <input type="text" value={schoolSlug} onChange={e => setSchoolSlug(e.target.value)}
                      placeholder="e.g. greenvalley" required
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-white/20 text-white"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                    {loadingSchool && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-white/30" />}
                    {schoolData && !loadingSchool && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 text-xs">Found</span>}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">Full Name</label>
                  <input type="text" value={form.name} onChange={e => update('name', e.target.value)} required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-white/20 text-white"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">Email</label>
                    <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required
                      placeholder="john@school.com"
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
                <button type="button" onClick={() => setStep(2)}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition bg-emerald-600 hover:bg-emerald-500">
                  Next Step
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">Roll Number</label>
                  <input type="text" value={form.rollNumber} onChange={e => update('rollNumber', e.target.value)} required
                    placeholder="e.g. 10A001"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-white/20 text-white"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">Class</label>
                  <select value={form.classId} onChange={e => update('classId', e.target.value)} required
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <option value="" className="bg-[#1a1816]">Select class</option>
                    {classes.map((c: any) => <option key={c.id} value={c.id} className="bg-[#1a1816]">{c.name}</option>)}
                  </select>
                </div>
                {sections.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">Section</label>
                    <select value={form.sectionId} onChange={e => update('sectionId', e.target.value)} required
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <option value="" className="bg-[#1a1816]">Select section</option>
                      {sections.map((s: any) => <option key={s.id} value={s.id} className="bg-[#1a1816]">{s.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">Gender</label>
                    <select value={form.gender} onChange={e => update('gender', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <option value="" className="bg-[#1a1816]">Select</option>
                      <option value="MALE" className="bg-[#1a1816]">Male</option>
                      <option value="FEMALE" className="bg-[#1a1816]">Female</option>
                      <option value="OTHER" className="bg-[#1a1816]">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">Date of Birth</label>
                    <input type="date" value={form.dob} onChange={e => update('dob', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">Address</label>
                  <input type="text" value={form.address} onChange={e => update('address', e.target.value)}
                    placeholder="Optional"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-white/20 text-white"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">Parent Phone (optional)</label>
                  <input type="text" value={form.parentPhone} onChange={e => update('parentPhone', e.target.value)}
                    placeholder="Link to existing parent account"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-white/20 text-white"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl text-sm font-medium text-white/60 transition"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-[2] py-3 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-2">
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Submit for Approval
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
