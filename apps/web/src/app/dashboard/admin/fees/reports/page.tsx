'use client';

import React, { useState } from 'react';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';
import { useFeeStats, useWaiverStats } from '@/hooks/useFees';
import { CheckCircle, Clock, BarChart3, Download, TrendingUp, TrendingDown, Zap, Gift } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminFeeReportsPage() {
  const { data: stats, isLoading } = useFeeStats();
  const [exporting, setExporting] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  const handleExport = () => {
    if (!stats) return;
    setExporting(true);

    const rows = [
        ['Metric', 'Value'],
        ['Total Fees Created', String(stats.totalFees)],
        ['Total Collected', formatCurrency(stats.totalCollected)],
        ['Total Outstanding', formatCurrency(stats.totalOutstanding)],
        ['Total Late Fees', formatCurrency(stats.totalLateFees)],
        ['Collection Rate', `${stats.collectionRate}%`],
        ['Amount Collection Rate', `${stats.amountCollectionRate}%`],
        ['Paid', String(stats.paidCount)],
        ['Pending', String(stats.pendingCount)],
        ['Partial', String(stats.partialCount)],
        ['Overdue', String(stats.overdueCount)],
        [''],
        ['Class Breakdown'],
        ['Class', 'Total', 'Collected', 'Outstanding', 'Late Fees', 'Students'],
        ...Object.entries(stats.classBreakdown).map(([className, data]) => [
          className,
          formatCurrency(data.total),
          formatCurrency(data.collected),
          formatCurrency(data.total - data.collected),
          formatCurrency(data.lateFees || 0),
          String(data.count),
        ]),
        [''],
        ['Monthly Trends'],
        ['Month', 'Collected', 'Outstanding'],
        ...(stats.monthlyData?.map(m => [m.month, formatCurrency(m.collected), formatCurrency(m.outstanding)]) || []),
      ];

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const maxCollected = Math.max(...(stats?.monthlyData?.map(m => m.collected) || [0]), 1);

  return (
    <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/admin/fees"
                className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-emerald-500/30 transition"
              >
                <ArrowLeft size={18} className="text-slate-400" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-emerald-400">Fee Reports & Analytics</h1>
                <p className="text-slate-400 text-sm">Comprehensive fee collection insights and trends</p>
              </div>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting || !stats}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm px-5 py-2.5 rounded-lg transition disabled:opacity-50"
            >
              <Download size={16} />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-sm text-emerald-400 font-mono tracking-wider">
              GENERATING ANALYTICS REPORT...
            </div>
          ) : !stats ? (
            <div className="p-12 text-center text-sm text-slate-500">
              No fee data available for reporting.
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Fees</span>
                    <BarChart3 size={18} className="text-indigo-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalFees}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Collected</span>
                    <TrendingUp size={18} className="text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.totalCollected)}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Outstanding</span>
                    <TrendingDown size={18} className="text-rose-400" />
                  </div>
                  <p className="text-2xl font-bold text-rose-400">{formatCurrency(stats.totalOutstanding)}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Late Fees</span>
                    <Zap size={18} className="text-rose-400" />
                  </div>
                  <p className="text-2xl font-bold text-rose-400">{formatCurrency(stats.totalLateFees)}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Collection Rate</span>
                    <CheckCircle size={18} className="text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{stats.collectionRate}%</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overdue</span>
                    <Clock size={18} className="text-rose-400" />
                  </div>
                  <p className="text-2xl font-bold text-rose-400">{stats.overdueCount}</p>
                </div>
              </div>

              {/* Monthly Trend Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-slate-200 mb-6">Monthly Collection Trend</h2>
                <div className="flex items-end gap-3 h-48">
                  {stats.monthlyData?.map((m) => {
                    const heightCollected = (m.collected / maxCollected) * 100;
                    const heightOutstanding = (m.outstanding / maxCollected) * 100;
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="w-full flex flex-col-reverse" style={{ height: '100%' }}>
                          <div
                            className="w-full bg-emerald-500/80 rounded-t transition-all hover:bg-emerald-400"
                            style={{ height: `${Math.max(heightCollected, 2)}%` }}
                            title={`Collected: ${formatCurrency(m.collected)}`}
                          />
                          <div
                            className="w-full bg-rose-500/60 rounded-t transition-all hover:bg-rose-400"
                            style={{ height: `${Math.max(heightOutstanding, 2)}%` }}
                            title={`Outstanding: ${formatCurrency(m.outstanding)}`}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono mt-2 -rotate-45 origin-left whitespace-nowrap">
                          {m.month}
                        </span>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-xs text-white px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 shadow-lg">
                          Collected: {formatCurrency(m.collected)}<br />
                          Outstanding: {formatCurrency(m.outstanding)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-500" />
                    <span className="text-xs text-slate-400">Collected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-rose-500" />
                    <span className="text-xs text-slate-400">Outstanding</span>
                  </div>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Class Breakdown */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                  <h2 className="text-lg font-semibold text-slate-200 mb-4">Class-wise Collection</h2>
                  <div className="space-y-3">
                    {Object.entries(stats.classBreakdown).map(([className, data]) => {
                      const classRate = data.total > 0 ? Math.round((data.collected / data.total) * 100) : 0;
                      return (
                        <div key={className}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300 font-medium">{className}</span>
                            <span className="text-slate-400 font-mono text-xs">
                              {formatCurrency(data.collected)} / {formatCurrency(data.total)}
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div className={`h-2 rounded-full transition-all ${classRate >= 80 ? 'bg-emerald-500' : classRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${classRate}%` }} />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                            <span>{data.count} students {data.lateFees > 0 ? `| Late fees: ${formatCurrency(data.lateFees)}` : ''}</span>
                            <span>{classRate}% collected</span>
                          </div>
                        </div>
                      );
                    })}
                    {Object.keys(stats.classBreakdown).length === 0 && (
                      <p className="text-sm text-slate-500">No class data available.</p>
                    )}
                  </div>
                </div>

                {/* Status Summary */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                  <h2 className="text-lg font-semibold text-slate-200 mb-4">Payment Status Overview</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Paid', count: stats.paidCount, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                      { label: 'Partial', count: stats.partialCount, color: 'bg-blue-500', textColor: 'text-blue-400' },
                      { label: 'Pending', count: stats.pendingCount, color: 'bg-amber-500', textColor: 'text-amber-400' },
                      { label: 'Overdue', count: stats.overdueCount, color: 'bg-rose-500', textColor: 'text-rose-400' },
                    ].map((item) => {
                      const pct = stats.totalFees > 0 ? Math.round((item.count / stats.totalFees) * 100) : 0;
                      return (
                        <div key={item.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className={item.textColor + ' font-medium'}>{item.label}</span>
                            <span className="text-slate-400">
                              {item.count} <span className="text-slate-600">({pct}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2.5">
                            <div className={`h-2.5 rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Waiver Analytics */}
              <WaiverAnalyticsSection />

              {/* Recent Fees */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-slate-200 mb-4">Recent Fee Activity</h2>
                {stats.recentFees.length === 0 ? (
                  <p className="text-sm text-slate-500">No recent activity.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs uppercase text-slate-500 tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="pb-3 pr-4">Student</th>
                          <th className="pb-3 pr-4">Fee Type</th>
                          <th className="pb-3 pr-4">Amount</th>
                          <th className="pb-3 pr-4">Paid</th>
                          <th className="pb-3 pr-4">Status</th>
                          <th className="pb-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {stats.recentFees.map((fee) => (
                          <tr key={fee.id} className="text-slate-300">
                            <td className="py-3 pr-4 font-medium text-white">{fee.student?.name || 'Unknown'}</td>
                            <td className="py-3 pr-4 text-slate-400">{fee.feeType}</td>
                            <td className="py-3 pr-4 font-mono">{formatCurrency(fee.amount)}</td>
                            <td className="py-3 pr-4 font-mono text-emerald-400">{formatCurrency(fee.paidAmount)}</td>
                            <td className="py-3 pr-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                                fee.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                fee.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                fee.status === 'PARTIAL' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}>
                                {fee.status}
                              </span>
                            </td>
                            <td className="py-3 text-slate-500 text-xs">
                              {new Date(fee.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}

function WaiverAnalyticsSection() {
  const { data: waiver, isLoading } = useWaiverStats();

  if (isLoading) return null;

  if (!waiver || waiver.count === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <Gift size={18} className="text-emerald-400" />
        <h2 className="text-lg font-semibold text-slate-200">Fee Waivers & Concessions</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Waived Amount</p>
          <p className="text-3xl font-extrabold text-emerald-400 font-mono">
            ₹{waiver.totalWaived.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500">{waiver.count} fee record(s) waived</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium mb-2">Waiver by Reason</p>
          <div className="space-y-2">
            {Object.entries(waiver.byReason)
              .sort(([, a], [, b]) => b - a)
              .map(([reason, amount]) => {
                const pct = waiver.totalWaived > 0 ? Math.round((amount / waiver.totalWaived) * 100) : 0;
                return (
                  <div key={reason}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-300">{reason}</span>
                      <span className="text-emerald-400 font-mono">₹{amount.toLocaleString('en-IN')} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
