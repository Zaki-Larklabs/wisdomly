'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Lock, CheckCircle, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full shadow-lg text-center">
        <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Reset Link</h1>
        <p className="text-sm text-slate-600 mb-6">This password reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium text-sm">Request a new reset link</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full shadow-lg text-center">
        <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Password Reset!</h1>
        <p className="text-sm text-slate-600 mb-6">Your password has been updated successfully.</p>
        <Link href="/login" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg transition text-sm">
          <ArrowLeft size={16} /> Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Lock size={24} className="text-blue-600" /> Reset Password</h1>
        <p className="text-sm text-slate-500 mt-1">Enter your new password.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
          <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
          <input type="password" required minLength={6} value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat password"
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 outline-none" />
        </div>
        {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 text-sm flex items-center justify-center gap-2">
          {loading && <Loader2 size={16} className="animate-spin" />}
          Reset Password
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
      <Suspense fallback={
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full shadow-lg text-center">
          <Loader2 size={32} className="animate-spin mx-auto text-slate-400" />
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
