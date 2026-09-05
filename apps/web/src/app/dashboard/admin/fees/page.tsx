'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';
import { useFees, useFeeStats, useCreateFee, useBulkCreateFees, usePayFee, useApplyLateFees, useSendReminders, useDeleteFee, useApplyWaiver, useUpdateFee, useBulkDeleteFees, FeeRecord } from '@/hooks/useFees';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DollarSign, AlertTriangle, CheckCircle, Clock, Plus, X, BarChart3, Users, Bell, Zap, Tag, Percent, Layers, Gift, Edit3, Trash2 } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  OVERDUE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  PARTIAL: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  WAIVED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function AdminFeesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [payingFee, setPayingFee] = useState<FeeRecord | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payRef, setPayRef] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedFees, setSelectedFees] = useState<Set<string>>(new Set());
  const [lateFeeResult, setLateFeeResult] = useState<string | null>(null);
  const [reminderResult, setReminderResult] = useState<string | null>(null);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [waiverReason, setWaiverReason] = useState('');
  const [waiverResult, setWaiverResult] = useState<string | null>(null);
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);
  const [editForm, setEditForm] = useState({ feeType: '', amount: '', dueDate: '', discount: '', discountReason: '', remarks: '' });
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkDeleteResult, setBulkDeleteResult] = useState<string | null>(null);

  const { data: fees, isLoading } = useFees();
  const { data: stats } = useFeeStats();
  const createFee = useCreateFee();
  const bulkCreate = useBulkCreateFees();
  const payFee = usePayFee();
  const applyLateFees = useApplyLateFees();
  const sendReminders = useSendReminders();
  const deleteFee = useDeleteFee();
  const applyWaiver = useApplyWaiver();
  const updateFee = useUpdateFee();
  const bulkDeleteFees = useBulkDeleteFees();

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data } = await api.get('/students');
      return data.data as Array<{ id: string; name: string; rollNumber: string; class: { name: string }; section: { name: string } }>;
    },
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await api.get('/classes');
      return data.data as Array<{ id: string; name: string; sections: Array<{ id: string; name: string }> }>;
    },
  });

  const filteredFees = fees?.filter(f => statusFilter === 'ALL' || f.status === statusFilter) || [];

  const [createForm, setCreateForm] = useState({
    studentId: '', feeType: 'Tuition Fee', amount: '', dueDate: '', discount: '', discountReason: '', remarks: '',
  });

  const [bulkForm, setBulkForm] = useState({
    classId: '', sectionId: '', feeType: 'Tuition Fee', amount: '', dueDate: '', discount: '', discountReason: '', remarks: '',
  });

  const [reminderForm, setReminderForm] = useState({ feeIds: '', message: '' });

  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [installmentPlan, setInstallmentPlan] = useState({
    studentId: '', classId: '', sectionId: '',
    feeType: 'Tuition Fee', totalAmount: '', numberOfInstallments: '4',
    frequency: 'quarterly' as 'monthly' | 'quarterly' | 'half_yearly',
    firstDueDate: '', discount: '', discountReason: '', remarks: '',
  });
  const [installmentResult, setInstallmentResult] = useState<any>(null);

  const queryClient = useQueryClient();
  const createInstallmentPlanMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/fees/installment-plan', payload);
      return data.data;
    },
    onSuccess: (result) => {
      setInstallmentResult(result);
      queryClient.invalidateQueries({ queryKey: ['fees'] });
    },
  });

  const lateFeeConfig = { percentagePerDay: 0.5, maxLateFeePercent: 20, graceDays: 7 };

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFee.mutateAsync({
        studentId: createForm.studentId,
        feeType: createForm.feeType,
        amount: parseFloat(createForm.amount),
        dueDate: createForm.dueDate,
        discount: createForm.discount ? parseFloat(createForm.discount) : undefined,
        discountReason: createForm.discountReason || undefined,
        remarks: createForm.remarks || undefined,
      });
      setShowCreateModal(false);
      setCreateForm({ studentId: '', feeType: 'Tuition Fee', amount: '', dueDate: '', discount: '', discountReason: '', remarks: '' });
    } catch { /* error handled by react query */ }
  };

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await bulkCreate.mutateAsync({
        classId: bulkForm.classId,
        sectionId: bulkForm.sectionId || undefined,
        feeType: bulkForm.feeType,
        amount: parseFloat(bulkForm.amount),
        dueDate: bulkForm.dueDate,
        discount: bulkForm.discount ? parseFloat(bulkForm.discount) : undefined,
        discountReason: bulkForm.discountReason || undefined,
        remarks: bulkForm.remarks || undefined,
      });
      alert(`Created ${result.created} fee records (${result.skipped} skipped, ${result.total} total students)`);
      setShowBulkModal(false);
      setBulkForm({ classId: '', sectionId: '', feeType: 'Tuition Fee', amount: '', dueDate: '', discount: '', discountReason: '', remarks: '' });
    } catch { /* error handled by react query */ }
  };

  const handleApplyLateFees = async () => {
    try {
      const result = await applyLateFees.mutateAsync(lateFeeConfig);
      setLateFeeResult(`Applied late fees to ${result.updated} overdue records`);
      setTimeout(() => setLateFeeResult(null), 5000);
    } catch { /* error handled by react query */ }
  };

  const handleSendReminders = async (e: React.FormEvent) => {
    e.preventDefault();
    const feeIds = reminderForm.feeIds
      ? reminderForm.feeIds.split(',').map(s => s.trim()).filter(Boolean)
      : Array.from(selectedFees);

    if (feeIds.length === 0) { alert('Select fees or enter fee IDs'); return; }

    try {
      const result = await sendReminders.mutateAsync({ feeIds, message: reminderForm.message || undefined });
      setReminderResult(`Sent ${result.sent} reminders for ${result.students} students`);
      setShowReminderModal(false);
      setReminderForm({ feeIds: '', message: '' });
      setSelectedFees(new Set());
      setTimeout(() => setReminderResult(null), 5000);
    } catch { /* error handled by react query */ }
  };

  const handlePayFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingFee) return;
    try {
      await payFee.mutateAsync({
        feeId: payingFee.id,
        paidAmount: parseFloat(payAmount),
        paymentGatewayRef: payRef || undefined,
      });
      setPayingFee(null);
      setPayAmount('');
      setPayRef('');
    } catch { /* error handled by react query */ }
  };

  const toggleSelectFee = (id: string) => {
    const next = new Set(selectedFees);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedFees(next);
  };

  const selectAllFiltered = () => {
    if (selectedFees.size === filteredFees.length) {
      setSelectedFees(new Set());
    } else {
      setSelectedFees(new Set(filteredFees.map(f => f.id)));
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  const selectedClass = classes?.find(c => c.id === bulkForm.classId);

  return (
    <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-3xl font-bold text-emerald-400">Fee Management</h1>
              <p className="text-slate-400 text-sm">Track, manage, and collect student fees</p>
            </div>
            <div className="flex items-center gap-3">
              {reminderResult && (
                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                  {reminderResult}
                </span>
              )}
              {lateFeeResult && (
                <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
                  {lateFeeResult}
                </span>
              )}
              {waiverResult && (
                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                  {waiverResult}
                </span>
              )}
              {bulkDeleteResult && (
                <span className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full">
                  {bulkDeleteResult}
                </span>
              )}
              <Link href="/dashboard/admin/fees/reports" className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-400 text-sm px-4 py-2.5 rounded-lg transition">
                <BarChart3 size={16} /> Reports
              </Link>
              <button onClick={() => setShowBulkModal(true)} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold px-4 py-2.5 rounded-lg transition">
                <Users size={16} /> Bulk Create
              </button>
              <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm px-4 py-2.5 rounded-lg transition">
                <Plus size={16} /> Create Fee
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Collected</span>
                <DollarSign size={14} className="text-emerald-400" />
              </div>
              <p className="text-lg font-bold text-white">{formatCurrency(stats?.totalCollected ?? 0)}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Outstanding</span>
                <AlertTriangle size={14} className="text-amber-400" />
              </div>
              <p className="text-lg font-bold text-amber-400">{formatCurrency(stats?.totalOutstanding ?? 0)}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Late Fees</span>
                <Zap size={14} className="text-rose-400" />
              </div>
              <p className="text-lg font-bold text-rose-400">{formatCurrency(stats?.totalLateFees ?? 0)}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Collection</span>
                <CheckCircle size={14} className="text-blue-400" />
              </div>
              <p className="text-lg font-bold text-blue-400">{stats?.collectionRate ?? 0}%</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Overdue</span>
                <Clock size={14} className="text-rose-400" />
              </div>
              <p className="text-lg font-bold text-rose-400">{stats?.overdueCount ?? 0}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Pending</span>
                <Bell size={14} className="text-amber-400" />
              </div>
              <p className="text-lg font-bold text-amber-400">{stats?.pendingCount ?? 0}</p>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Actions:</span>
            <button
              onClick={handleApplyLateFees}
              disabled={applyLateFees.isPending}
              className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold px-3 py-2 rounded-lg transition disabled:opacity-50"
            >
              <Zap size={14} />
              {applyLateFees.isPending ? 'Applying...' : 'Apply Late Fees'}
            </button>
            <button
              onClick={() => setShowReminderModal(true)}
              disabled={selectedFees.size === 0}
              className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-bold px-3 py-2 rounded-lg transition disabled:opacity-50"
            >
              <Bell size={14} />
              Send Reminders ({selectedFees.size})
            </button>
            <button
              onClick={() => setShowInstallmentModal(true)}
              className="flex items-center gap-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs font-bold px-3 py-2 rounded-lg transition"
            >
              <Layers size={14} />
              Installment Plan
            </button>
            <button
              onClick={() => setShowWaiverModal(true)}
              disabled={selectedFees.size === 0}
              className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-2 rounded-lg transition disabled:opacity-50"
            >
              <Gift size={14} />
              Waive ({selectedFees.size})
            </button>
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              disabled={selectedFees.size === 0}
              className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold px-3 py-2 rounded-lg transition disabled:opacity-50"
            >
              <Trash2 size={14} />
              Delete ({selectedFees.size})
            </button>
            <span className="text-[10px] text-slate-600 ml-2">
              Late fee: {lateFeeConfig.percentagePerDay}%/day • {lateFeeConfig.graceDays} days grace • max {lateFeeConfig.maxLateFeePercent}%
            </span>
          </div>

          {/* Fee Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-200">Fee Records</h2>
                <span className="text-xs text-slate-500">({filteredFees.length} of {fees?.length ?? 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={selectAllFiltered} className="text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded border border-slate-800">
                  {selectedFees.size === filteredFees.length ? 'Deselect All' : 'Select All'}
                </button>
                {['ALL', 'PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'WAIVED'].map((status) => (
                  <button key={status} onClick={() => setStatusFilter(status)}
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition ${
                      statusFilter === status
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}>
                    {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-sm text-emerald-400 font-mono tracking-wider">LOADING FEE REGISTRY...</div>
            ) : filteredFees.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-500">No fee records found. Create a new fee to get started.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 uppercase text-slate-500 tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-3 w-8"><input type="checkbox" checked={selectedFees.size === filteredFees.length && filteredFees.length > 0} onChange={selectAllFiltered} className="accent-emerald-500" /></th>
                      <th className="px-3 py-3">Student</th>
                      <th className="px-3 py-3">Fee Type</th>
                      <th className="px-3 py-3 text-right">Amount</th>
                      <th className="px-3 py-3 text-right">Discount</th>
                      <th className="px-3 py-3 text-right">Late Fee</th>
                      <th className="px-3 py-3 text-right">Paid</th>
                      <th className="px-3 py-3 text-right">Due</th>
                      <th className="px-3 py-3">Due Date</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredFees.map((fee) => (
                      <tr key={fee.id} className={`hover:bg-slate-800/30 transition ${selectedFees.has(fee.id) ? 'bg-emerald-500/5' : ''}`}>
                        <td className="px-3 py-3">
                          <input type="checkbox" checked={selectedFees.has(fee.id)} onChange={() => toggleSelectFee(fee.id)} className="accent-emerald-500" />
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-medium text-white text-xs">{fee.student.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{fee.student.rollNumber} — {fee.student.class.name}</p>
                        </td>
                        <td className="px-3 py-3 text-[10px]">
                          <span className="text-slate-300">{fee.feeType}</span>
                          {(() => {
                            try {
                              const r = JSON.parse(fee.remarks || '{}');
                              if (r.installmentGroupId) {
                                return <span className="ml-1.5 text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded-full font-bold">{r.installmentNumber}/{r.totalInstallments}</span>;
                              }
                            } catch {}
                            return null;
                          })()}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-white font-bold">{formatCurrency(fee.amount)}</td>
                        <td className="px-3 py-3 text-right">
                          {fee.discount > 0 ? (
                            <span className="text-emerald-400 font-mono text-[10px]">-{formatCurrency(fee.discount)}</span>
                          ) : <span className="text-slate-600">—</span>}
                        </td>
                        <td className="px-3 py-3 text-right">
                          {fee.lateFee > 0 ? (
                            <span className="text-rose-400 font-mono text-[10px]">+{formatCurrency(fee.lateFee)}</span>
                          ) : <span className="text-slate-600">—</span>}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-emerald-400">{formatCurrency(fee.paidAmount)}</td>
                        <td className="px-3 py-3 text-right font-mono">
                          <span className={fee.effectiveAmount - fee.paidAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                            {formatCurrency(fee.effectiveAmount - fee.paidAmount)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-400 text-[10px]">
                          {new Date(fee.dueDate).toLocaleDateString()}
                          {fee.daysOverdue > 0 && <span className="text-rose-500 ml-1">({fee.daysOverdue}d)</span>}
                        </td>
                        <td className="px-3 py-3">
                          {fee.status === 'PAID' && fee.receiptUrl ? (
                            <Link href={`/dashboard/receipts/${fee.id}`}
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${STATUS_COLORS[fee.status]} hover:opacity-80 transition inline-flex items-center gap-1`}>
                              <CheckCircle size={8} />
                              {fee.status}
                            </Link>
                          ) : (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${STATUS_COLORS[fee.status]}`}>
                              {fee.status}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {fee.status !== 'PAID' && (
                              <button onClick={() => { setPayingFee(fee); setPayAmount(String(fee.effectiveAmount - fee.paidAmount)); }}
                                className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg transition">
                                Pay
                              </button>
                            )}
                            {fee.status !== 'PAID' && fee.status !== 'WAIVED' && (
                              <button onClick={() => { setEditingFee(fee); setEditForm({ feeType: fee.feeType, amount: String(fee.amount), dueDate: fee.dueDate.split('T')[0], discount: String(fee.discount || ''), discountReason: '', remarks: '' }); }}
                                className="text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-lg transition">
                                <Edit3 size={10} />
                              </button>
                            )}
                            <button onClick={() => setDeleteConfirm(fee.id)}
                              className="text-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-2 py-1 rounded-lg transition">
                              Del
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Create Fee Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Create Fee Record</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white transition"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateFee} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Student</label>
                  <select required value={createForm.studentId} onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none">
                    <option value="">Select a student</option>
                    {students?.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.rollNumber}) — {s.class.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Fee Type</label>
                  <select value={createForm.feeType} onChange={(e) => setCreateForm({ ...createForm, feeType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none">
                    {['Tuition Fee', 'Exam Fee', 'Library Fee', 'Transport Fee', 'Lab Fee', 'Sports Fee', 'Development Fee', 'Other'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount (₹)</label>
                    <input type="number" required min="1" step="0.01" value={createForm.amount}
                      onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Due Date</label>
                    <input type="date" required value={createForm.dueDate}
                      onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1"><Tag size={12} /> Discount</label>
                    <input type="number" min="0" step="0.01" value={createForm.discount}
                      onChange={(e) => setCreateForm({ ...createForm, discount: e.target.value })}
                      placeholder="0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Discount Reason</label>
                    <input type="text" value={createForm.discountReason}
                      onChange={(e) => setCreateForm({ ...createForm, discountReason: e.target.value })}
                      placeholder="e.g. Merit scholarship"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Remarks (optional)</label>
                  <input type="text" value={createForm.remarks}
                    onChange={(e) => setCreateForm({ ...createForm, remarks: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={createFee.isPending}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition disabled:opacity-50 text-sm">
                    {createFee.isPending ? 'Creating...' : 'Create Fee'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Create Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Bulk Create Fees</h3>
                  <p className="text-xs text-slate-400 mt-1">Create fee records for an entire class or section</p>
                </div>
                <button onClick={() => setShowBulkModal(false)} className="text-slate-500 hover:text-white transition"><X size={20} /></button>
              </div>
              <form onSubmit={handleBulkCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Class</label>
                    <select required value={bulkForm.classId} onChange={(e) => setBulkForm({ ...bulkForm, classId: e.target.value, sectionId: '' })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none">
                      <option value="">Select class</option>
                      {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Section (optional)</label>
                    <select value={bulkForm.sectionId} onChange={(e) => setBulkForm({ ...bulkForm, sectionId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none">
                      <option value="">All sections</option>
                      {selectedClass?.sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Fee Type</label>
                  <select value={bulkForm.feeType} onChange={(e) => setBulkForm({ ...bulkForm, feeType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none">
                    {['Tuition Fee', 'Exam Fee', 'Library Fee', 'Transport Fee', 'Lab Fee', 'Sports Fee', 'Development Fee', 'Other'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount (₹)</label>
                    <input type="number" required min="1" step="0.01" value={bulkForm.amount}
                      onChange={(e) => setBulkForm({ ...bulkForm, amount: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Due Date</label>
                    <input type="date" required value={bulkForm.dueDate}
                      onChange={(e) => setBulkForm({ ...bulkForm, dueDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1"><Percent size={12} /> Discount</label>
                    <input type="number" min="0" step="0.01" value={bulkForm.discount}
                      onChange={(e) => setBulkForm({ ...bulkForm, discount: e.target.value })} placeholder="0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Discount Reason</label>
                    <input type="text" value={bulkForm.discountReason}
                      onChange={(e) => setBulkForm({ ...bulkForm, discountReason: e.target.value })} placeholder="e.g. Bulk discount"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Remarks (optional)</label>
                  <input type="text" value={bulkForm.remarks}
                    onChange={(e) => setBulkForm({ ...bulkForm, remarks: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowBulkModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={bulkCreate.isPending}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition disabled:opacity-50 text-sm">
                    {bulkCreate.isPending ? 'Creating...' : `Create for Class`}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Send Reminders Modal */}
        {showReminderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Send Fee Reminders</h3>
                  <p className="text-xs text-slate-400 mt-1">{selectedFees.size} fees selected</p>
                </div>
                <button onClick={() => setShowReminderModal(false)} className="text-slate-500 hover:text-white transition"><X size={20} /></button>
              </div>
              <form onSubmit={handleSendReminders} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Fee IDs (comma separated, or use selected)</label>
                  <input type="text" value={reminderForm.feeIds}
                    onChange={(e) => setReminderForm({ ...reminderForm, feeIds: e.target.value })}
                    placeholder={Array.from(selectedFees).join(', ')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Custom Message (optional)</label>
                  <textarea rows={3} value={reminderForm.message}
                    onChange={(e) => setReminderForm({ ...reminderForm, message: e.target.value })}
                    placeholder="Default: Your fee is due. Please pay at the earliest."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowReminderModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={sendReminders.isPending}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition disabled:opacity-50 text-sm">
                    {sendReminders.isPending ? 'Sending...' : `Send to ${selectedFees.size} fees`}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Pay Fee Modal */}
        {payingFee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Record Payment</h3>
                  <p className="text-sm text-slate-400 mt-1">{payingFee.student.name} — {payingFee.feeType}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Amount: {formatCurrency(payingFee.amount)}
                    {payingFee.lateFee > 0 && <span className="text-rose-400 ml-2">+ Late fee: {formatCurrency(payingFee.lateFee)}</span>}
                    {payingFee.discount > 0 && <span className="text-emerald-400 ml-2">- Discount: {formatCurrency(payingFee.discount)}</span>}
                  </p>
                </div>
                <button onClick={() => setPayingFee(null)} className="text-slate-500 hover:text-white transition"><X size={20} /></button>
              </div>
              <form onSubmit={handlePayFee} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount to Pay (₹)</label>
                  <input type="number" required min="1" max={payingFee.effectiveAmount - payingFee.paidAmount} step="0.01"
                    value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
                  <p className="text-xs text-slate-500 mt-1">Remaining: {formatCurrency(payingFee.effectiveAmount - payingFee.paidAmount)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Payment Reference</label>
                  <input type="text" value={payRef} onChange={(e) => setPayRef(e.target.value)}
                    placeholder="Transaction ID / Receipt No."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setPayingFee(null)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={payFee.isPending}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition disabled:opacity-50 text-sm">
                    {payFee.isPending ? 'Processing...' : 'Confirm Payment'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Waiver Modal */}
        {showWaiverModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Gift size={20} className="text-emerald-400" /> Apply Fee Waiver</h3>
                  <p className="text-xs text-slate-400 mt-1">{selectedFees.size} fee(s) selected</p>
                </div>
                <button onClick={() => { setShowWaiverModal(false); setWaiverReason(''); }} className="text-slate-500 hover:text-white transition"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Waiver Reason</label>
                  <textarea rows={3} required value={waiverReason} onChange={(e) => setWaiverReason(e.target.value)}
                    placeholder="e.g. Full scholarship, Financial hardship, Merit award..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none resize-none" />
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs">
                  <p className="text-amber-400 font-bold flex items-center gap-1"><AlertTriangle size={12} /> Warning</p>
                  <p className="text-slate-400 mt-1">Waiving a fee marks it as WAIVED and sets paid amount to zero. This action can only be reversed by recreating the fee.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setShowWaiverModal(false); setWaiverReason(''); }}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition text-sm font-medium">Cancel</button>
                  <button onClick={async () => {
                    if (!waiverReason.trim()) return;
                    try {
                      const result = await applyWaiver.mutateAsync({ feeIds: Array.from(selectedFees), reason: waiverReason });
                      setWaiverResult(`Waived ${result.waived} fee(s) — ₹${result.totalAmount.toLocaleString('en-IN')}`);
                      setShowWaiverModal(false);
                      setWaiverReason('');
                      setSelectedFees(new Set());
                      setTimeout(() => setWaiverResult(null), 6000);
                    } catch { /* handled by react query */ }
                  }} disabled={applyWaiver.isPending || !waiverReason.trim()}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition disabled:opacity-50 text-sm">
                    {applyWaiver.isPending ? 'Applying...' : `Waive ${selectedFees.size} Fee(s)`}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Fee Modal */}
        {editingFee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Edit3 size={20} className="text-blue-400" /> Edit Fee</h3>
                  <p className="text-xs text-slate-400 mt-1">{editingFee.student.name} — {editingFee.feeType}</p>
                </div>
                <button onClick={() => setEditingFee(null)} className="text-slate-500 hover:text-white transition"><X size={20} /></button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await updateFee.mutateAsync({ feeId: editingFee.id, feeType: editForm.feeType, amount: editForm.amount ? parseFloat(editForm.amount) : undefined, dueDate: editForm.dueDate || undefined, discount: editForm.discount ? parseFloat(editForm.discount) : undefined, discountReason: editForm.discountReason || undefined, remarks: editForm.remarks || undefined });
                  setEditingFee(null);
                } catch { /* handled */ }
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Fee Type</label>
                  <input type="text" required value={editForm.feeType} onChange={(e) => setEditForm({ ...editForm, feeType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount (₹)</label>
                    <input type="number" required min="1" step="0.01" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Due Date</label>
                    <input type="date" required value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1"><Tag size={12} /> Discount</label>
                    <input type="number" min="0" step="0.01" value={editForm.discount} onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })} placeholder="0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Discount Reason</label>
                    <input type="text" value={editForm.discountReason} onChange={(e) => setEditForm({ ...editForm, discountReason: e.target.value })} placeholder="Reason"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Remarks</label>
                  <input type="text" value={editForm.remarks} onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditingFee(null)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={updateFee.isPending}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold transition disabled:opacity-50 text-sm">
                    {updateFee.isPending ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Delete Confirmation */}
        {showBulkDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
              <Trash2 size={40} className="mx-auto text-rose-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Delete {selectedFees.size} Fee Records?</h3>
              <p className="text-sm text-slate-400 mb-2">This will permanently delete the selected fee records.</p>
              <p className="text-xs text-amber-400 mb-6">Paid fees cannot be deleted and will be skipped.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowBulkDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition text-sm font-medium">Cancel</button>
                <button onClick={async () => {
                  try {
                    const result = await bulkDeleteFees.mutateAsync(Array.from(selectedFees));
                    setBulkDeleteResult(`Deleted ${result.deleted} fee record(s)`);
                    setShowBulkDeleteConfirm(false);
                    setSelectedFees(new Set());
                    setTimeout(() => setBulkDeleteResult(null), 5000);
                  } catch { /* handled */ }
                }} disabled={bulkDeleteFees.isPending}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold transition disabled:opacity-50 text-sm">
                  {bulkDeleteFees.isPending ? 'Deleting...' : `Delete ${selectedFees.size}`}</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
              <AlertTriangle size={40} className="mx-auto text-rose-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Delete Fee Record?</h3>
              <p className="text-sm text-slate-400 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition text-sm font-medium">Cancel</button>
                <button onClick={() => { if (deleteConfirm) { deleteFee.mutate(deleteConfirm); setDeleteConfirm(null); } }} disabled={deleteFee.isPending}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold transition disabled:opacity-50 text-sm">
                  {deleteFee.isPending ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Installment Plan Modal */}
        {showInstallmentModal && !installmentResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Layers size={20} className="text-purple-400" /> Create Installment Plan</h3>
                  <p className="text-xs text-slate-400 mt-1">Split a large fee into multiple installments</p>
                </div>
                <button onClick={() => setShowInstallmentModal(false)} className="text-slate-500 hover:text-white transition"><X size={20} /></button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const payload: any = { feeType: installmentPlan.feeType, totalAmount: parseFloat(installmentPlan.totalAmount), numberOfInstallments: parseInt(installmentPlan.numberOfInstallments), frequency: installmentPlan.frequency, firstDueDate: installmentPlan.firstDueDate, discount: installmentPlan.discount ? parseFloat(installmentPlan.discount) : 0, discountReason: installmentPlan.discountReason || undefined, remarks: installmentPlan.remarks || undefined };
                if (installmentPlan.studentId) payload.studentId = installmentPlan.studentId;
                else if (installmentPlan.classId) { payload.classId = installmentPlan.classId; if (installmentPlan.sectionId) payload.sectionId = installmentPlan.sectionId; }
                await createInstallmentPlanMutation.mutateAsync(payload);
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Target</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center gap-2 bg-slate-950 border rounded-lg px-3 py-2.5 cursor-pointer ${installmentPlan.classId ? 'border-slate-800' : 'border-purple-500/30 bg-purple-500/5'}`}>
                      <input type="radio" name="targetType" checked={!installmentPlan.studentId && !installmentPlan.classId} onChange={() => setInstallmentPlan({ ...installmentPlan, studentId: '', classId: '', sectionId: '' })}
                        className="accent-purple-500" />
                      <span className="text-xs text-slate-300">Entire Class</span>
                    </label>
                    <label className={`flex items-center gap-2 bg-slate-950 border rounded-lg px-3 py-2.5 cursor-pointer ${installmentPlan.studentId ? 'border-purple-500/30 bg-purple-500/5' : 'border-slate-800'}`}>
                      <input type="radio" name="targetType" checked={!!installmentPlan.studentId} onChange={() => setInstallmentPlan({ ...installmentPlan, studentId: 'select', classId: '', sectionId: '' })}
                        className="accent-purple-500" />
                      <span className="text-xs text-slate-300">Single Student</span>
                    </label>
                  </div>
                </div>
                {installmentPlan.studentId === 'select' ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Student</label>
                    <select required value={installmentPlan.studentId} onChange={(e) => setInstallmentPlan({ ...installmentPlan, studentId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-purple-500 outline-none">
                      <option value="select">Select a student</option>
                      {students?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber}) — {s.class.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Class</label>
                      <select value={installmentPlan.classId} onChange={(e) => setInstallmentPlan({ ...installmentPlan, classId: e.target.value, sectionId: '' })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-purple-500 outline-none">
                        <option value="">All classes</option>
                        {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Section</label>
                      <select value={installmentPlan.sectionId} onChange={(e) => setInstallmentPlan({ ...installmentPlan, sectionId: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-purple-500 outline-none">
                        <option value="">All sections</option>
                        {classes?.find(c => c.id === installmentPlan.classId)?.sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Fee Type</label>
                  <select value={installmentPlan.feeType} onChange={(e) => setInstallmentPlan({ ...installmentPlan, feeType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-purple-500 outline-none">
                    {['Tuition Fee', 'Annual Fee', 'Admission Fee', 'Development Fee', 'Exam Fee', 'Library Fee', 'Transport Fee', 'Lab Fee', 'Sports Fee', 'Other'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Total Amount (₹)</label>
                    <input type="number" required min="1" step="0.01" value={installmentPlan.totalAmount}
                      onChange={(e) => setInstallmentPlan({ ...installmentPlan, totalAmount: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-purple-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Installments</label>
                    <select value={installmentPlan.numberOfInstallments} onChange={(e) => setInstallmentPlan({ ...installmentPlan, numberOfInstallments: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-purple-500 outline-none">
                      {[2, 3, 4, 6, 8, 12].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Frequency</label>
                    <select value={installmentPlan.frequency} onChange={(e) => setInstallmentPlan({ ...installmentPlan, frequency: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-purple-500 outline-none">
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="half_yearly">Half Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">First Due Date</label>
                    <input type="date" required value={installmentPlan.firstDueDate}
                      onChange={(e) => setInstallmentPlan({ ...installmentPlan, firstDueDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-purple-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1"><Percent size={12} /> Discount</label>
                    <input type="number" min="0" step="0.01" value={installmentPlan.discount}
                      onChange={(e) => setInstallmentPlan({ ...installmentPlan, discount: e.target.value })} placeholder="0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-purple-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Discount Reason</label>
                    <input type="text" value={installmentPlan.discountReason}
                      onChange={(e) => setInstallmentPlan({ ...installmentPlan, discountReason: e.target.value })}
                      placeholder="e.g. Early payment"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-purple-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Remarks (optional)</label>
                  <input type="text" value={installmentPlan.remarks}
                    onChange={(e) => setInstallmentPlan({ ...installmentPlan, remarks: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-purple-500 outline-none" />
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-1">
                  <p className="text-purple-400 font-bold">Preview</p>
                  {installmentPlan.totalAmount && installmentPlan.numberOfInstallments ? (
                    <>
                      <p className="text-slate-300">Per installment: <span className="text-white font-bold font-mono">₹{(parseFloat(installmentPlan.totalAmount) / parseInt(installmentPlan.numberOfInstallments)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></p>
                      <p className="text-slate-300">Total fees to create: {installmentPlan.studentId && installmentPlan.studentId !== 'select' ? '1 student × ' : ''}{installmentPlan.numberOfInstallments} installments = {installmentPlan.numberOfInstallments}{installmentPlan.studentId && installmentPlan.studentId !== 'select' ? '' : ' per student'}</p>
                    </>
                  ) : (
                    <p className="text-slate-500 italic">Enter total amount and installments to see preview</p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowInstallmentModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={createInstallmentPlanMutation.isPending}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold transition disabled:opacity-50 text-sm">
                    {createInstallmentPlanMutation.isPending ? 'Creating...' : `Create ${installmentPlan.numberOfInstallments} Installment${parseInt(installmentPlan.numberOfInstallments) > 1 ? 's' : ''}`}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Installment Plan Result */}
        {installmentResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><CheckCircle size={20} className="text-emerald-400" /> Installment Plan Created</h3>
                  <p className="text-xs text-slate-400 mt-1">{installmentResult.totalFeesCreated} fee records generated</p>
                </div>
                <button onClick={() => { setShowInstallmentModal(false); setInstallmentResult(null); setInstallmentPlan({ studentId: '', classId: '', sectionId: '', feeType: 'Tuition Fee', totalAmount: '', numberOfInstallments: '4', frequency: 'quarterly', firstDueDate: '', discount: '', discountReason: '', remarks: '' }); }}
                  className="text-slate-500 hover:text-white transition"><X size={20} /></button>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Plan ID</span><span className="text-purple-400 font-mono">{installmentResult.installmentGroupId}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Total Amount</span><span className="text-white font-bold font-mono">₹{installmentResult.totalAmount.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Per Installment</span><span className="text-white font-bold font-mono">₹{installmentResult.perInstallment.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Frequency</span><span className="text-slate-200 capitalize">{installmentResult.frequency.replace('_', ' ')}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Students</span><span className="text-slate-200">{installmentResult.studentsCount}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Fees Created</span><span className="text-emerald-400 font-bold">{installmentResult.totalFeesCreated}</span></div>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={() => { setShowInstallmentModal(false); setInstallmentResult(null); setInstallmentPlan({ studentId: '', classId: '', sectionId: '', feeType: 'Tuition Fee', totalAmount: '', numberOfInstallments: '4', frequency: 'quarterly', firstDueDate: '', discount: '', discountReason: '', remarks: '' }); }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition text-sm font-medium">Close</button>
                <button onClick={() => { setShowInstallmentModal(false); setInstallmentResult(null); setInstallmentPlan({ studentId: '', classId: '', sectionId: '', feeType: 'Tuition Fee', totalAmount: '', numberOfInstallments: '4', frequency: 'quarterly', firstDueDate: '', discount: '', discountReason: '', remarks: '' }); window.location.reload(); }}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold transition text-sm">
                  Refresh List
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
