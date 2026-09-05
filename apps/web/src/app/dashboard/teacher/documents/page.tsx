'use client';

import React, { useEffect, useState } from 'react';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';
import { api } from '@/lib/api';
import { FileText, Upload, Loader2, X, Trash2, Download } from 'lucide-react';

export default function TeacherDocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', fileUrl: '', fileType: 'pdf', fileSize: 0, category: '', classId: '' });

  const fetchDocs = () => {
    api.get('/documents').then(r => setDocs(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/documents', { ...form, fileSize: form.fileSize || 1024 });
      setShowUpload(false);
      setForm({ title: '', description: '', fileUrl: '', fileType: 'pdf', fileSize: 0, category: '', classId: '' });
      fetchDocs();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchDocs();
    } catch {}
  };

  return (
    <RoleGuard allowedRoles={['TEACHER']}>
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-emerald-400" />
              <h1 className="text-xl font-bold text-white">Documents</h1>
            </div>
            <button onClick={() => setShowUpload(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition">
              <Upload size={14} /> Upload
            </button>
          </div>

          {loading ? (
            <div className="text-center py-24"><Loader2 size={24} className="animate-spin mx-auto text-slate-500" /></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map(doc => (
                <div key={doc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{doc.title}</p>
                      <p className="text-[10px] text-slate-500">{doc.fileType?.toUpperCase()} · {doc.category || 'Uncategorized'}</p>
                      {doc.description && <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">{doc.description}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-slate-600">by {doc.uploadedBy?.name || 'Unknown'}</span>
                        <span className="text-[10px] text-slate-600">{new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                      <a href={doc.fileUrl} target="_blank" className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-blue-400"><Download size={14} /></a>
                      <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
              {docs.length === 0 && (
                <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                  <FileText size={40} className="mx-auto text-slate-700 mb-3" />
                  <p className="text-slate-400">No documents uploaded yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {showUpload && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowUpload(false)}>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">Upload Document</h2>
                <button onClick={() => setShowUpload(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"><X size={18} /></button>
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Title"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                <input type="url" value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} required placeholder="File URL"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                <div className="grid grid-cols-2 gap-4">
                  <select value={form.fileType} onChange={e => setForm({ ...form, fileType: e.target.value })}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none">
                    <option value="pdf">PDF</option><option value="doc">DOC</option><option value="xls">XLS</option><option value="ppt">PPT</option><option value="image">Image</option><option value="other">Other</option>
                  </select>
                  <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Category"
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Description"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none resize-none" />
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-sm transition">
                  Upload Document
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
