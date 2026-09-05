'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DollarSign, ArrowLeft, ChevronDown, ChevronUp, CreditCard, FileText } from 'lucide-react';

interface ParentFeeRecord {
  id: string;
  feeType: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: string;
  paidAt: string | null;
  receiptUrl: string | null;
  remarks: string | null;
  lateFee: number;
  effectiveAmount: number;
  discount: number;
  daysOverdue: number;
}

interface StudentFee {
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  fees: ParentFeeRecord[];
  totalDue: number;
  totalPaid: number;
  totalLateFees: number;
  totalDiscount: number;
}

export default function ParentFeesPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('wisdomly_token');
        const childrenRes = await fetch('/api/v1/parents/me/children', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!childrenRes.ok) {
          setStudents([]);
          setLoading(false);
          return;
        }

        const childrenData = await childrenRes.json();
        const children = childrenData.data || [];

        const feePromises = children.map(async (child: any) => {
          const feeRes = await fetch(`/api/v1/fees?studentId=${child.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const feeData = await feeRes.json();
          const fees = feeData.data || [];

          return {
            studentId: child.id,
            studentName: child.name,
            rollNumber: child.rollNumber,
            className: `${child.class?.name || ''} ${child.section?.name || ''}`,
            fees,
            totalDue: fees.reduce((sum: number, f: any) =>
              sum + (f.status !== 'PAID' ? (f.effectiveAmount || f.amount) - f.paidAmount : 0), 0),
            totalPaid: fees.reduce((sum: number, f: any) => sum + f.paidAmount, 0),
            totalLateFees: fees.reduce((sum: number, f: any) => sum + (f.lateFee || 0), 0),
            totalDiscount: fees.reduce((sum: number, f: any) => sum + (f.discount || 0), 0),
          };
        });

        const results = await Promise.all(feePromises);
        setStudents(results);
      } catch (err) {
        console.error('Failed to load fee data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PAID: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
      OVERDUE: 'bg-red-100 text-red-800 border-red-200',
      PARTIAL: 'bg-blue-100 text-blue-800 border-blue-200',
      WAIVED: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Fee Management</h1>
            <p className="mt-2 text-gray-600">View and track fees for all your children.</p>
          </div>
          <Link
            href="/dashboard/parent"
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
          >
            <ArrowLeft size={16} className="mr-1.5" />
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Fee Records</h3>
            <p className="text-gray-500">No fee records found for your children.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {students.map((student) => {
              const isExpanded = expanded === student.studentId;
              const pendingCount = student.fees.filter(f => f.status === 'PENDING' || f.status === 'OVERDUE').length;

              return (
                <div key={student.studentId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Student Header */}
                  <div
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => setExpanded(isExpanded ? null : student.studentId)}
                  >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                          {student.studentName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{student.studentName}</h3>
                          <p className="text-sm text-gray-500">Roll No: {student.rollNumber} — {student.className}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {student.fees.some(f => f.status !== 'PAID' && f.status !== 'WAIVED') && (
                          <button onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/parent/fees/checkout?feeIds=${student.fees.filter(f => f.status !== 'PAID' && f.status !== 'WAIVED').map(f => f.id).join(',')}`); }}
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition">
                            <CreditCard size={13} />
                            Pay All Due
                          </button>
                        )}
                        {student.totalLateFees > 0 && (
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500">Late Fees</p>
                          <p className="text-sm font-bold text-red-500">{formatCurrency(student.totalLateFees)}</p>
                        </div>
                      )}
                      {student.totalDiscount > 0 && (
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500">Discount</p>
                          <p className="text-sm font-bold text-green-600">{formatCurrency(student.totalDiscount)}</p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Due</p>
                        <p className="text-lg font-bold text-red-600">{formatCurrency(student.totalDue)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Paid</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(student.totalPaid)}</p>
                      </div>
                      {pendingCount > 0 && (
                        <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
                          {pendingCount} Pending
                        </span>
                      )}
                      {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </div>
                  </div>

                  {/* Fee Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200">
                      {student.fees.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No fee records for this student.</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                                <th className="px-4 py-3 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">Base Amount</th>
                                <th className="px-4 py-3 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                                <th className="px-4 py-3 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">Late Fee</th>
                                <th className="px-4 py-3 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                <th className="px-4 py-3 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {student.fees.map((fee) => (
                                <tr key={fee.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{fee.feeType}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 text-right">{formatCurrency(fee.amount)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                    {fee.discount > 0 ? <span className="text-green-600 font-medium">-{formatCurrency(fee.discount)}</span> : <span className="text-gray-300">—</span>}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                    {fee.lateFee > 0 ? <span className="text-red-500 font-medium">+{formatCurrency(fee.lateFee)}</span> : <span className="text-gray-300">—</span>}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium text-right">{formatCurrency(fee.paidAmount)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold">
                                    <span className={fee.effectiveAmount - fee.paidAmount > 0 ? 'text-amber-600' : 'text-green-600'}>
                                      {formatCurrency(fee.effectiveAmount - fee.paidAmount)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(fee.dueDate).toLocaleDateString()}
                                    {fee.daysOverdue > 0 && (
                                      <span className="ml-1 text-red-500 text-[10px] font-bold">({fee.daysOverdue}d)</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`inline-flex text-xs font-bold px-2 py-0.5 rounded-full border ${statusBadge(fee.status)}`}>
                                      {fee.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {fee.receiptUrl ? (
                                      <Link href={`/dashboard/receipts/${fee.id}`} className="text-green-600 font-mono text-xs hover:text-green-700 underline underline-offset-2 transition">
                                        {fee.receiptUrl}
                                      </Link>
                                    ) : fee.status !== 'PAID' && fee.status !== 'WAIVED' ? (
                                      <button onClick={() => router.push(`/dashboard/parent/fees/checkout?feeIds=${fee.id}`)}
                                        className="inline-flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1.5 rounded-lg transition">
                                        <CreditCard size={12} />
                                        Pay
                                      </button>
                                    ) : <span className="text-gray-300">—</span>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
