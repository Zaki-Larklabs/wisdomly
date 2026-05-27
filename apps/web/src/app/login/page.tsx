'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    role: 'ADMIN',
    schoolSlug: 'greenvalley-school', // Default fallback for development testing
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(formData);
    } catch (err) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosError.response?.data?.error?.message || 'Authentication configuration rejected');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
      <div className="w-full max-w-md bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-2xl">
        <h2 className="text-3xl font-bold mb-2 text-center text-emerald-400">Wisdomly</h2>
        <p className="text-slate-400 text-center mb-6 text-sm">Enterprise Multi-Tenant Portal</p>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Scope Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ADMIN">Administrator</option>
              <option value="TEACHER">Instructor / Teacher</option>
              <option value="STUDENT">Student</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Identifier (Email or Roll No.)</label>
            <input
              type="text"
              required
              placeholder="admin@greenvalley.edu"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Security Key</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 transition text-slate-950 font-bold py-3 rounded-lg mt-2 disabled:opacity-50"
          >
            {submitting ? 'Authenticating System...' : 'Access Portal'}
          </button>
        </form>
      </div>
    </div>
  );
}