'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';
import { useFees } from '@/hooks/useFees';
import { DollarSign, AlertTriangle, CheckCircle, Clock, ArrowLeft, Zap, Tag, CreditCard, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  OVERDUE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  PARTIAL: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  WAIVED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function StudentFeesPage() {
  const router = useRouter();
  const { data: fees, isLoading } = useFees();
  const [selectedFees, setSelectedFees] = useState<Set<string>>(new Set());

  const totalDue = fees?.reduce((sum, f) => sum + (f.effectiveAmount - f.paidAmount), 0) ?? 0;
  const totalPaid = fees?.reduce((sum, f) => sum + f.paidAmount, 0) ?? 0;
  const totalLateFees = fees?.reduce((sum, f) => sum + f.lateFee, 0) ?? 0;
  const totalDiscount = fees?.reduce((sum, f) => sum + f.discount, 0) ?? 0;

  const unpaidFees = useMemo(() =>
    fees?.filter(f => f.status !== 'PAID' && f.status !== 'WAIVED') ?? [],
    [fees]
  );

  const selectedAmount = useMemo(() =>
    selectedFees.size > 0
      ? (fees ?? []).filter(f => selectedFees.has(f.id)).reduce((sum, f) => sum + (f.effectiveAmount - f.paidAmount), 0)
      : 0,
    [selectedFees, fees]
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedFees);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedFees(next);
  };

  const proceedToCheckout = (feeIds: string[]) => {
    router.push(`/dashboard/student/fees/checkout?feeIds=${feeIds.join(',')}`);
  };

  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-slate-950 text-white">
        <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-xl">💰</span>
            <div>
              <h1 className="text-lg font-bold text-white">My Fees</h1>
              <p className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase font-bold">Fee Statements & Payments</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {selectedFees.size > 0 && (
              <button onClick={() => proceedToCheckout(Array.from(selectedFees))}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition">
                <ShoppingCart size={14} />
                Pay Selected ({formatCurrency(selectedAmount)})
              </button>
            )}
            <Link href="/dashboard/student" className="bg-slate-950 border border-slate-800 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 text-xs px-4 py-2 rounded-lg transition flex items-center gap-1.5">
              <ArrowLeft size={14} /> Back
            </Link>
          </div>
        </header>

        <main className="p-8 max-w-5xl w-full mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Paid</span>
                <CheckCircle size={18} className="text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Due</span>
                <AlertTriangle size={18} className="text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-amber-400">{formatCurrency(totalDue)}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Late Fees</span>
                <Zap size={18} className="text-rose-400" />
              </div>
              <p className="text-2xl font-bold text-rose-400">{formatCurrency(totalLateFees)}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Discount Availed</span>
                <Tag size={18} className="text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalDiscount)}</p>
            </div>
          </div>

          {unpaidFees.length > 0 && (
            <div className="bg-slate-900 border border-emerald-500/20 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">Pay Online</h3>
                </div>
                <span className="text-xs text-slate-500">{unpaidFees.length} pending fees</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {unpaidFees.slice(0, 5).map(fee => (
                  <button key={fee.id} onClick={() => proceedToCheckout([fee.id])}
                    className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-2 rounded-lg transition">
                    Pay {fee.feeType} — {formatCurrency(fee.effectiveAmount - fee.paidAmount)}
                  </button>
                ))}
                {unpaidFees.length > 5 && (
                  <span className="text-xs text-slate-500 flex items-center">+{unpaidFees.length - 5} more</span>
                )}
              </div>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-200">Fee History</h2>
              {selectedFees.size > 0 && (
                <button onClick={() => setSelectedFees(new Set())} className="text-xs text-slate-500 hover:text-slate-300">
                  Clear selection
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-sm text-emerald-400 font-mono tracking-wider">LOADING FEE RECORDS...</div>
            ) : !fees || fees.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-500">No fee records found for your account.</div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {fees.map((fee) => (
                  <div key={fee.id} className={`p-5 hover:bg-slate-800/30 transition ${selectedFees.has(fee.id) ? 'bg-emerald-500/5' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {(fee.status === 'PENDING' || fee.status === 'OVERDUE' || fee.status === 'PARTIAL') && (
                          <input type="checkbox" checked={selectedFees.has(fee.id)} onChange={() => toggleSelect(fee.id)}
                            className="mt-1 accent-emerald-500" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{fee.feeType}</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${STATUS_COLORS[fee.status]}`}>
                              {fee.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 mt-1">
                            <span>Base: <span className="font-mono text-white font-bold">{formatCurrency(fee.amount)}</span></span>
                            {fee.discount > 0 && <span>Discount: <span className="font-mono text-emerald-400">-{formatCurrency(fee.discount)}</span></span>}
                            {fee.lateFee > 0 && <span>Late Fee: <span className="font-mono text-rose-400">+{formatCurrency(fee.lateFee)}</span></span>}
                            <span>Paid: <span className="font-mono text-emerald-400">{formatCurrency(fee.paidAmount)}</span></span>
                            <span>Balance: <span className="font-mono text-amber-400">{formatCurrency(fee.effectiveAmount - fee.paidAmount)}</span></span>
                            <span>Due: {new Date(fee.dueDate).toLocaleDateString()}</span>
                            {fee.daysOverdue > 0 && <span className="text-rose-400 font-bold">{fee.daysOverdue}d overdue</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-2">
                        <div>
                          <p className="text-[10px] text-slate-600 font-mono">{new Date(fee.createdAt).toLocaleDateString()}</p>
                          {fee.paidAt && <p className="text-[10px] text-emerald-600 font-mono mt-0.5">Paid: {new Date(fee.paidAt).toLocaleDateString()}</p>}
                          {fee.receiptUrl && (
                            <Link href={`/dashboard/receipts/${fee.id}`} className="text-[10px] text-emerald-500 font-mono mt-0.5 hover:text-emerald-400 underline underline-offset-2 transition">
                              Receipt: {fee.receiptUrl}
                            </Link>
                          )}
                        </div>
                        {fee.status !== 'PAID' && fee.status !== 'WAIVED' && (
                          <button onClick={() => proceedToCheckout([fee.id])}
                            className="flex items-center gap-1 text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition">
                            <CreditCard size={12} />
                            Pay Online
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Payment Information</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pay online instantly via Card, UPI, or Net Banking. Late fee of 0.5% per day applies after a 7-day grace period from the due date.
            </p>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
