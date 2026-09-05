'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [schoolSlug, setSchoolSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { identifier, role, schoolSlug: schoolSlug || undefined });
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-lg">
          <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Check Your Inbox</h1>
          <p className="text-sm text-slate-600 mb-6">If an account with that identifier exists, we've sent password reset instructions.</p>
          <Link href="/login" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full shadow-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Mail size={24} className="text-blue-600" /> Forgot Password</h1>
          <p className="text-sm text-slate-500 mt-1">Enter your email or phone to receive reset instructions.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email or Phone</label>
            <input type="text" required value={identifier} onChange={e => setIdentifier(e.target.value)}
              placeholder="you@example.com or +91..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 outline-none">
              <option value="STUDENT">Student</option>
              <option value="PARENT">Parent</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {role !== 'SUPER_ADMIN' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">School (slug)</label>
              <input type="text" value={schoolSlug} onChange={e => setSchoolSlug(e.target.value)}
                placeholder="e.g. greenvalley"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 outline-none" />
            </div>
          )}
          {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 text-sm flex items-center justify-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Send Reset Instructions
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
