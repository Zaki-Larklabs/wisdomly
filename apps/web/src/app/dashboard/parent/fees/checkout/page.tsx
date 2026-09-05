'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCheckoutPay } from '@/hooks/useFees';
import { Shield, CreditCard, Smartphone, Building, CheckCircle, XCircle, ArrowLeft, Loader } from 'lucide-react';
import Link from 'next/link';

type PaymentMethod = 'CARD' | 'UPI' | 'NET_BANKING';

const PAYMENT_METHODS: Array<{ id: PaymentMethod; label: string; icon: React.ReactNode }> = [
  { id: 'CARD', label: 'Credit / Debit Card', icon: <CreditCard size={20} /> },
  { id: 'UPI', label: 'UPI', icon: <Smartphone size={20} /> },
  { id: 'NET_BANKING', label: 'Net Banking', icon: <Building size={20} /> },
];

interface FeeItem {
  id: string;
  feeType: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: string;
  lateFee: number;
  effectiveAmount: number;
  discount: number;
  daysOverdue: number;
}

export default function ParentCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const feeIds = searchParams.get('feeIds')?.split(',').filter(Boolean) || [];

  const checkoutPay = useCheckoutPay();
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'review' | 'payment' | 'processing' | 'success' | 'failed'>('review');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const token = localStorage.getItem('wisdomly_token');
        const results = await Promise.all(
          feeIds.map(id =>
            fetch(`/api/v1/fees/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
          )
        );
        setFees(results.map(r => r.data).filter(Boolean));
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    if (feeIds.length) fetchFees();
    else setLoading(false);
  }, [feeIds]);

  const totalAmount = useMemo(() =>
    fees.reduce((sum, f) => sum + (f.effectiveAmount || f.amount) - f.paidAmount, 0),
    [fees]
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  const handleProcessPayment = async () => {
    setStep('processing');
    await new Promise(r => setTimeout(r, 2000));
    try {
      const res = await checkoutPay.mutateAsync({ feeIds });
      if (res.results?.some((r: any) => r.status === 'FAILED')) {
        setErrorMsg('Some payments failed. Please try again.');
        setResult(res);
        setStep('failed');
      } else {
        setResult(res);
        setStep('success');
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error?.message || 'Payment failed.');
      setStep('failed');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle size={16} className="text-emerald-400" />;
      case 'ALREADY_PAID': return <CheckCircle size={16} className="text-blue-400" />;
      case 'FAILED': return <XCircle size={16} className="text-rose-400" />;
      default: return <Loader size={16} className="text-amber-400" />;
    }
  };

  if (!feeIds.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle size={48} className="mx-auto text-gray-300" />
          <h2 className="text-xl font-bold text-gray-900">No fees selected</h2>
          <p className="text-gray-500">Please select fees from your children's account.</p>
          <Link href="/dashboard/parent/fees" className="inline-block px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">Back to Fees</Link>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/parent/fees" className="p-2 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition">
            <ArrowLeft size={18} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Secure Checkout</h1>
            <p className="text-xs text-gray-500">Parent Payment Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Shield size={14} className="text-blue-600" />
          Secured Payment
        </div>
      </header>

      <main className="p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-gray-500">
          {['review', 'payment', 'success'].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                step === s || (step === 'processing' && s === 'payment') || (step === 'failed' && (s === 'review' || s === 'payment'))
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : step === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'border-gray-200 text-gray-400'
              }`}>
                {i + 1}. {s === 'review' ? 'Review' : s === 'payment' ? 'Pay' : 'Receipt'}
              </div>
              {i < 2 && <div className="w-8 h-px bg-gray-200" />}
            </React.Fragment>
          ))}
        </div>

        {step === 'review' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                {fees.map(fee => (
                  <div key={fee.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{fee.feeType}</p>
                      <p className="text-xs text-gray-500">Due: {new Date(fee.dueDate).toLocaleDateString()}{fee.daysOverdue > 0 ? <span className="text-red-500 ml-1">({fee.daysOverdue}d overdue)</span> : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency((fee.effectiveAmount || fee.amount) - fee.paidAmount)}</p>
                      {fee.lateFee > 0 && <p className="text-xs text-red-500">+{formatCurrency(fee.lateFee)} late fee</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-2xl font-black text-blue-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
            <button onClick={() => setStep('payment')} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl transition">
              Proceed to Pay {formatCurrency(totalAmount)}
            </button>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {PAYMENT_METHODS.map(m => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition ${
                      paymentMethod === m.id ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                    {m.icon}
                    <span className="text-xs font-medium">{m.label}</span>
                  </button>
                ))}
              </div>
              {paymentMethod === 'CARD' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Card Number</label>
                    <input type="text" placeholder="4111 1111 1111 1111" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Expiry</label>
                      <input type="text" placeholder="MM/YY" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">CVV</label>
                      <input type="password" placeholder="***" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono" />
                    </div>
                  </div>
                </div>
              )}
              {paymentMethod === 'UPI' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">UPI ID</label>
                  <input type="text" placeholder="parent@upi" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
              )}
              {paymentMethod === 'NET_BANKING' && (
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map(b => <option key={b}>{b}</option>)}
                </select>
              )}
            </div>
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-black text-blue-600">{formatCurrency(totalAmount)}</p>
              </div>
              <button onClick={handleProcessPayment} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl transition">
                Pay {formatCurrency(totalAmount)}
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-sm text-gray-500">Please wait...</p>
          </div>
        )}

        {step === 'success' && result && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-green-200 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Payment Successful!</h2>
              <p className="text-sm text-gray-500">Transaction: <span className="font-mono text-green-600">{result.transactionId}</span></p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/parent/fees" className="flex-1 text-center py-3 bg-gray-100 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition text-sm">Back to Fees</Link>
              <button onClick={() => window.print()} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition text-sm">Print Receipt</button>
            </div>
          </div>
        )}

        {step === 'failed' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
              <XCircle size={32} className="mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h2>
              <p className="text-sm text-red-500">{errorMsg}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('payment')} className="flex-1 py-3 bg-gray-100 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition text-sm">Try Again</button>
              <Link href="/dashboard/parent/fees" className="flex-1 text-center py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition text-sm">Cancel</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
