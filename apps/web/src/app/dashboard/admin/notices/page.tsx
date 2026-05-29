'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';
import { RoleGuard } from '../../../../components/ui/layouts/RoleGuard';

interface Notice {
  id: string;
  title: string;
  content: string;
  targetRole: string;
  createdAt: string;
}

export default function CommunicationsPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', targetRole: 'ALL' });

  const fetchBroadcasts = async () => {
    try {
      const response = await api.get('/notices');
      setNotices(response.data.data);
    } catch (err) {
      console.error('Failed to load broadcasts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBroadcasts(); }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/notices', formData);
      setFormData({ title: '', content: '', targetRole: 'ALL' });
      fetchBroadcasts();
    } catch (err) {
      console.error('Transmission failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div>
            <h1 className="text-3xl font-bold text-emerald-400">Global Communications</h1>
            <p className="text-slate-400 text-sm">Transmit broadcasts to specific network roles.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Transmission Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-semibold text-slate-200">Compose Broadcast</h2>
              <form onSubmit={handleBroadcast} className="space-y-3">
                <input
                  type="text" required placeholder="Announcement Title"
                  value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none"
                />
                <select
                  value={formData.targetRole} onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none"
                >
                  <option value="ALL">Entire Network (Everyone)</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="TEACHER">Faculty Only</option>
                  <option value="PARENT">Parents Only</option>
                </select>
                <textarea
                  required placeholder="Broadcast message content..." rows={5}
                  value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none resize-none"
                />
                <button type="submit" disabled={submitting} className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-lg disabled:opacity-50">
                  {submitting ? 'Transmitting...' : 'Send Broadcast'}
                </button>
              </form>
            </div>

            {/* Broadcast History Feed */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-slate-200">Recent Transmissions</h2>
              {loading ? (
                <div className="text-emerald-400 text-xs font-mono">SYNCING FEED...</div>
              ) : notices.length === 0 ? (
                <div className="text-slate-500 text-sm">No recent broadcasts found in system logs.</div>
              ) : (
                <div className="space-y-3">
                  {notices.map((notice) => (
                    <div key={notice.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-white text-lg">{notice.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          notice.targetRole === 'ALL' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          Target: {notice.targetRole}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{notice.content}</p>
                      <div className="mt-4 text-[10px] text-slate-500 font-mono">
                        Posted: {new Date(notice.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </RoleGuard>
  );
}