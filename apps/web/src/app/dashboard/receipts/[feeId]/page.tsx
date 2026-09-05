'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Download, CheckCircle, Building2, User, Hash, Calendar, DollarSign, FileText } from 'lucide-react';
import { api } from '@/lib/api';

interface ReceiptData {
  receiptNumber: string;
  transactionId: string;
  schoolName: string;
  schoolAddress: string;
  schoolEmail: string;
  schoolPhone: string;
  studentName: string;
  rollNumber: string;
  className: string;
  sectionName: string;
  feeType: string;
  amount: number;
  lateFee: number;
  discount: number;
  paidAmount: number;
  effectiveAmount: number;
  dueDate: string;
  paidAt: string;
  status: string;
  createdAt: string;
}

export default function ReceiptViewPage() {
  const params = useParams();
  const router = useRouter();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const { data } = await api.get(`/fees/${params.feeId}/receipt`);
        setReceipt(data.data);
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || 'Failed to load receipt');
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [params.feeId]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  if (error || !receipt) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md text-center shadow-lg">
        <FileText size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Receipt Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'This receipt could not be loaded.'}</p>
        <button onClick={() => router.back()} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition text-sm">
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition text-sm font-medium">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg transition">
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden" id="receipt-content">
          {/* Receipt Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Building2 size={24} /> {receipt.schoolName}
                </h1>
                {receipt.schoolAddress && <p className="text-blue-200 text-sm mt-1">{receipt.schoolAddress}</p>}
                <p className="text-blue-200 text-xs mt-0.5">{receipt.schoolEmail} | {receipt.schoolPhone}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold tracking-tight">RECEIPT</p>
                <p className="text-blue-200 text-xs font-mono mt-1">#{receipt.receiptNumber}</p>
              </div>
            </div>
          </div>

          {/* Receipt Body */}
          <div className="p-8 space-y-8">
            {/* Status Badge */}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <CheckCircle size={18} className="text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-800">Payment Confirmed</p>
                <p className="text-xs text-emerald-600">Transaction ID: {receipt.transactionId}</p>
              </div>
            </div>

            {/* Two Column Info */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} /> Student Details
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Name</span>
                    <span className="font-semibold text-slate-900">{receipt.studentName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Roll No</span>
                    <span className="font-semibold text-slate-900">{receipt.rollNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Class</span>
                    <span className="font-semibold text-slate-900">{receipt.className}{receipt.sectionName ? ` — ${receipt.sectionName}` : ''}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Hash size={14} /> Payment Details
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Receipt No</span>
                    <span className="font-mono font-semibold text-slate-900 text-xs">{receipt.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Transaction ID</span>
                    <span className="font-mono font-semibold text-slate-900 text-xs">{receipt.transactionId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Payment Date</span>
                    <span className="font-semibold text-slate-900">{formatDate(receipt.paidAt || receipt.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <DollarSign size={14} /> Fee Breakdown
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Fee Type</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-3 text-slate-700">{receipt.feeType}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-900">{formatCurrency(receipt.amount)}</td>
                    </tr>
                    {receipt.discount > 0 && (
                      <tr>
                        <td className="px-4 py-3 text-slate-500">Discount</td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-600">-{formatCurrency(receipt.discount)}</td>
                      </tr>
                    )}
                    {receipt.lateFee > 0 && (
                      <tr>
                        <td className="px-4 py-3 text-slate-500">Late Fee</td>
                        <td className="px-4 py-3 text-right font-mono text-rose-600">+{formatCurrency(receipt.lateFee)}</td>
                      </tr>
                    )}
                    <tr className="bg-slate-50 font-bold">
                      <td className="px-4 py-3 text-slate-700">Total Paid</td>
                      <td className="px-4 py-3 text-right font-mono text-blue-700 text-lg">{formatCurrency(receipt.paidAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar size={14} />
              Due Date: {formatDate(receipt.dueDate)}
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="border-t border-slate-200 px-8 py-4 text-center">
            <p className="text-xs text-slate-400">This is a computer-generated receipt and does not require a physical signature.</p>
            <p className="text-xs text-slate-400 mt-0.5">Generated on {formatDate(new Date().toISOString())}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 0.5in; }
        }
      `}</style>
    </div>
  );
}
