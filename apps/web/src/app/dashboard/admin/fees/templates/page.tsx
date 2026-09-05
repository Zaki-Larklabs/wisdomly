'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Plus, X, Layers, Trash2, CheckCircle, AlertTriangle, ArrowLeft, Play, BookTemplate } from 'lucide-react';

interface FeeTemplate {
  id: string;
  name: string;
  description: string | null;
  items: Array<{ feeType: string; amount: number; dueDate: string; discount?: number }>;
  isActive: boolean;
  createdAt: string;
}

export default function FeeTemplatesPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', description: '', items: [{ feeType: 'Tuition Fee', amount: '', dueDate: '', discount: '' }] });

  const [applyForm, setApplyForm] = useState({ classId: '', sectionId: '' });

  const { data: templates, isLoading } = useQuery({
    queryKey: ['fee-templates'],
    queryFn: async () => {
      const { data } = await api.get('/fees/templates');
      return data.data as FeeTemplate[];
    },
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await api.get('/classes');
      return data.data as Array<{ id: string; name: string; sections: Array<{ id: string; name: string }> }>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => { const { data } = await api.post('/fees/templates', payload); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fee-templates'] }); setShowCreateModal(false); setResult('Template created'); setTimeout(() => setResult(null), 4000); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/fees/templates/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fee-templates'] }); setDeleteConfirm(null); setResult('Template deleted'); setTimeout(() => setResult(null), 4000); },
  });

  const applyMutation = useMutation({
    mutationFn: async (payload: any) => { const { data } = await api.post('/fees/templates/apply', payload); return data.data; },
    onSuccess: (result) => { setShowApplyModal(null); setResult(`Applied "${result.templateName}" — ${result.created} fees created (${result.skipped} skipped)`); setTimeout(() => setResult(null), 6000); queryClient.invalidateQueries({ queryKey: ['fees'] }); },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const items = form.items.map(i => ({ feeType: i.feeType, amount: parseFloat(i.amount), dueDate: i.dueDate, discount: i.discount ? parseFloat(i.discount) : 0 }));
    createMutation.mutate({ name: form.name, description: form.description || undefined, items });
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showApplyModal) return;
    applyMutation.mutate({ templateId: showApplyModal, classId: applyForm.classId, sectionId: applyForm.sectionId || undefined });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { feeType: 'Tuition Fee', amount: '', dueDate: '', discount: '' }] });
  const removeItem = (idx: number) => form.items.length > 1 && setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateItem = (idx: number, field: string, value: string) => {
    const items = [...form.items];
    (items[idx] as any)[field] = value;
    setForm({ ...form, items });
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  const selectedClass = classes?.find(c => c.id === applyForm.classId);

  return (
    <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/admin/fees" className="text-slate-400 hover:text-white transition"><ArrowLeft size={20} /></Link>
              <div>
                <h1 className="text-2xl font-bold text-purple-400 flex items-center gap-2"><BookTemplate size={24} /> Fee Templates</h1>
                <p className="text-slate-400 text-sm">Create reusable fee packages and apply them to classes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {result && <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">{result}</span>}
              <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold px-4 py-2.5 rounded-lg transition">
                <Plus size={16} /> New Template
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-16 text-emerald-400 font-mono text-xs tracking-widest">LOADING TEMPLATES...</div>
          ) : !templates?.length ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 text-center">
              <Layers size={48} className="mx-auto text-slate-600 mb-4" />
              <h2 className="text-lg font-bold text-slate-300">No Fee Templates</h2>
              <p className="text-sm text-slate-500 mt-1">Create a template to quickly generate fees for classes.</p>
              <button onClick={() => setShowCreateModal(true)} className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded-lg transition text-sm">
                Create First Template
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {templates.map(t => (
                <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-purple-500/30 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-200">{t.name}</h3>
                      {t.description && <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setShowApplyModal(t.id); setApplyForm({ classId: '', sectionId: '' }); }}
                        className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1.5 rounded-lg transition">
                        <Play size={12} /> Apply
                      </button>
                      <button onClick={() => setDeleteConfirm(t.id)}
                        className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold px-3 py-1.5 rounded-lg transition">
                        <Trash2 size={12} /> Del
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-950 text-slate-500 uppercase tracking-wider border-b border-slate-800">
                        <tr><th className="text-left px-3 py-2">Fee Type</th><th className="text-right px-3 py-2">Amount</th><th className="text-right px-3 py-2">Discount</th><th className="text-right px-3 py-2">Due Date</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {t.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 text-slate-300">{item.feeType}</td>
                            <td className="px-3 py-2 text-right font-mono text-white">{formatCurrency(item.amount)}</td>
                            <td className="px-3 py-2 text-right font-mono text-emerald-400">{item.discount ? formatCurrency(item.discount) : '—'}</td>
                            <td className="px-3 py-2 text-right text-slate-400">{new Date(item.dueDate).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-950 border-t border-slate-800">
                        <tr><td className="px-3 py-2 text-slate-400 font-medium">Total</td>
                          <td className="px-3 py-2 text-right font-mono text-white font-bold">{formatCurrency(t.items.reduce((s, i) => s + i.amount, 0))}</td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-400">{formatCurrency(t.items.reduce((s, i) => s + (i.discount || 0), 0))}</td>
                          <td className="px-3 py-2 text-right text-slate-500">{t.items.length} items</td></tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Template Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Layers size={20} className="text-purple-400" /> Create Fee Template</h3>
                  <p className="text-xs text-slate-400 mt-1">Define a reusable fee package with multiple items</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white transition"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Template Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Standard Annual Package 2026-27"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Description (optional)</label>
                  <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. Includes tuition, exam, and lab fees"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-medium text-slate-400">Fee Items</label>
                    <button type="button" onClick={addItem} className="text-xs text-purple-400 hover:text-purple-300 font-bold">+ Add Item</button>
                  </div>
                  <div className="space-y-3">
                    {form.items.map((item, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                        <div className="grid grid-cols-4 gap-2">
                          <div className="col-span-2">
                            <select value={item.feeType} onChange={e => updateItem(idx, 'feeType', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white focus:border-purple-500 outline-none">
                              {['Tuition Fee', 'Exam Fee', 'Library Fee', 'Transport Fee', 'Lab Fee', 'Sports Fee', 'Development Fee', 'Annual Fee', 'Admission Fee', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <input type="number" required min="1" step="0.01" placeholder="Amount" value={item.amount}
                              onChange={e => updateItem(idx, 'amount', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white focus:border-purple-500 outline-none" />
                          </div>
                          <div className="flex gap-1">
                            <input type="date" required value={item.dueDate} onChange={e => updateItem(idx, 'dueDate', e.target.value)}
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white focus:border-purple-500 outline-none" />
                            {form.items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="text-rose-400 hover:text-rose-300 px-1"><X size={14} /></button>}
                          </div>
                        </div>
                        <div className="mt-2">
                          <input type="number" min="0" step="0.01" placeholder="Discount (optional)" value={item.discount}
                            onChange={e => updateItem(idx, 'discount', e.target.value)}
                            className="w-40 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-white focus:border-purple-500 outline-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={createMutation.isPending}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold transition disabled:opacity-50 text-sm">
                    {createMutation.isPending ? 'Creating...' : 'Create Template'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Apply Template Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Play size={20} className="text-emerald-400" /> Apply Template</h3>
                  <p className="text-xs text-slate-400 mt-1">Generate fees for an entire class</p>
                </div>
                <button onClick={() => setShowApplyModal(null)} className="text-slate-500 hover:text-white transition"><X size={20} /></button>
              </div>
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Target Class</label>
                  <select required value={applyForm.classId} onChange={e => setApplyForm({ ...applyForm, classId: e.target.value, sectionId: '' })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none">
                    <option value="">Select class</option>
                    {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Section (optional)</label>
                  <select value={applyForm.sectionId} onChange={e => setApplyForm({ ...applyForm, sectionId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none">
                    <option value="">All sections</option>
                    {selectedClass?.sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                {applyMutation.isSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-xs text-emerald-400">
                    <CheckCircle size={14} className="inline mr-1" /> Fees generated successfully!
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowApplyModal(null)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={applyMutation.isPending}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition disabled:opacity-50 text-sm">
                    {applyMutation.isPending ? 'Applying...' : 'Generate Fees'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
              <AlertTriangle size={40} className="mx-auto text-rose-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Delete Template?</h3>
              <p className="text-sm text-slate-400 mb-6">Existing fees generated from this template will not be affected.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition text-sm font-medium">Cancel</button>
                <button onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)} disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold transition disabled:opacity-50 text-sm">
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
