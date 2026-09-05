'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';
import { useFees, useCheckoutPay } from '@/hooks/useFees';
import { api } from '@/lib/api';
import { Shield, CreditCard, Smartphone, Building, CheckCircle, XCircle, ArrowLeft, Loader } from 'lucide-react';
import Link from 'next/link';

type PaymentMethod = 'CARD' | 'UPI' | 'NET_BANKING' | 'STRIPE';

const PAYMENT_METHODS: Array<{ id: PaymentMethod; label: string; icon: React.ReactNode }> = [
  { id: 'CARD', label: 'Credit / Debit Card', icon: <CreditCard size={20} /> },
  { id: 'UPI', label: 'UPI', icon: <Smartphone size={20} /> },
  { id: 'NET_BANKING', label: 'Net Banking', icon: <Building size={20} /> },
  { id: 'STRIPE', label: 'Pay Online (Stripe)', icon: <CreditCard size={20} /> },
];

const CARD_BRANDS = ['Visa', 'Mastercard', 'RuPay'];

export default function StudentCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const feeIds = searchParams.get('feeIds')?.split(',').filter(Boolean) || [];

  const { data: fees, isLoading } = useFees();
  const checkoutPay = useCheckoutPay();

  const [step, setStep] = useState<'review' | 'payment' | 'processing' | 'success' | 'failed'>('review');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '', brand: 'Visa' });
  const [upiId, setUpiId] = useState('student@wisdomly');
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedFees = useMemo(() => {
    if (!fees) return [];
    return fees.filter(f => feeIds.includes(f.id));
  }, [fees, feeIds]);

  const totalAmount = useMemo(() =>
    selectedFees.reduce((sum, f) => sum + (f.effectiveAmount - f.paidAmount), 0),
    [selectedFees]
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  const handleStripePayment = async (feeId: string) => {
    try {
      const res = await api.post('/payments/create-checkout', { feeId });
      if (res.data.data?.url) {
        window.location.href = res.data.data.url;
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error?.message || 'Failed to initiate payment');
      setStep('failed');
    }
  };

  const handleProcessPayment = async () => {
    if (paymentMethod === 'STRIPE' && selectedFees.length === 1) {
      return handleStripePayment(selectedFees[0].id);
    }
    if (paymentMethod === 'STRIPE' && selectedFees.length > 1) {
      setErrorMsg('Stripe checkout supports single fee payment. Select one fee or use another method.');
      return;
    }
    setStep('processing');
    setErrorMsg('');

    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 2000));

    try {
      const res = await checkoutPay.mutateAsync({ feeIds });
      if (res.results.some((r: any) => r.status === 'FAILED')) {
        setErrorMsg('Some payments failed. Please try again.');
        setResult(res);
        setStep('failed');
      } else {
        setResult(res);
        setStep('success');
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error?.message || 'Payment failed. Please try again.');
      setStep('failed');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle size={16} className="text-emerald-400" />;
      case 'ALREADY_PAID': return <CheckCircle size={16} className="text-blue-400" />;
      case 'FAILED': return <XCircle size={16} className="text-rose-400" />;
      case 'PARTIAL': return <Loader size={16} className="text-amber-400" />;
      default: return null;
    }
  };

  if (!feeIds.length) {
    return (
      <RoleGuard allowedRoles={['STUDENT']}>
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <div className="text-center space-y-4">
            <XCircle size={48} className="mx-auto text-rose-400" />
            <h2 className="text-xl font-bold">No fees selected</h2>
            <p className="text-slate-400">Please select fees to pay from your fee list.</p>
            <Link href="/dashboard/student/fees" className="inline-block px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-600 transition">
              Back to Fees
            </Link>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-slate-950 text-white">
        <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/student/fees" className="p-2 bg-slate-950 border border-slate-800 rounded-lg hover:border-emerald-500/30 transition">
              <ArrowLeft size={18} className="text-slate-400" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white">Secure Checkout</h1>
              <p className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase font-bold">Payment Gateway</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Shield size={14} className="text-emerald-400" />
            Secured with 256-bit encryption
          </div>
        </header>

        <main className="p-8 max-w-3xl mx-auto space-y-6">
          {/* Stepper */}
          <div className="flex items-center justify-center gap-2 text-xs font-mono">
            {['review', 'payment', 'success'].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                  step === s || (step === 'processing' && s === 'payment') || (step === 'failed' && (s === 'review' || s === 'payment'))
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : step === 'success' && (s === 'review' || s === 'payment' || s === 'success')
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'border-slate-800 text-slate-600'
                }`}>
                  {i + 1}. {s === 'review' ? 'Review' : s === 'payment' ? 'Pay' : 'Receipt'}
                </div>
                {i < 2 && <div className="w-8 h-px bg-slate-800" />}
              </React.Fragment>
            ))}
          </div>

          {/* Review Step */}
          {step === 'review' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-slate-200 mb-4">Order Summary</h2>
                <div className="space-y-3">
                  {selectedFees.map(fee => (
                    <div key={fee.id} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-white">{fee.feeType}</p>
                        <p className="text-[10px] text-slate-500">
                          {fee.student.name} — Due: {new Date(fee.dueDate).toLocaleDateString()}
                          {fee.daysOverdue > 0 && <span className="text-rose-400 ml-1">({fee.daysOverdue}d overdue)</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">{formatCurrency(fee.effectiveAmount - fee.paidAmount)}</p>
                        {fee.lateFee > 0 && <p className="text-[10px] text-rose-400">incl. {formatCurrency(fee.lateFee)} late fee</p>}
                        {fee.discount > 0 && <p className="text-[10px] text-emerald-400">-{formatCurrency(fee.discount)} discount</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800">
                  <span className="text-base font-bold text-white">Total</span>
                  <span className="text-2xl font-black text-emerald-400">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={() => setStep('payment')}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-base rounded-xl transition"
              >
                Proceed to Pay {formatCurrency(totalAmount)}
              </button>
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-slate-200 mb-4">Choose Payment Method</h2>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {PAYMENT_METHODS.map(m => (
                    <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition ${
                        paymentMethod === m.id
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}>
                      {m.icon}
                      <span className="text-[10px] font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>

                {paymentMethod === 'CARD' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Card Number</label>
                      <div className="relative">
                        <input type="text" placeholder="4111 1111 1111 1111" maxLength={19}
                          value={cardDetails.number} onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none pr-20 font-mono tracking-wider" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-mono">{cardDetails.brand}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Expiry</label>
                        <input type="text" placeholder="MM/YY" maxLength={5}
                          value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none font-mono" />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">CVV</label>
                        <input type="password" placeholder="***" maxLength={4}
                          value={cardDetails.cvv} onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none font-mono" />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Card Brand</label>
                        <select value={cardDetails.brand} onChange={(e) => setCardDetails({ ...cardDetails, brand: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none">
                          {CARD_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Cardholder Name</label>
                      <input type="text" placeholder="John Doe"
                        value={cardDetails.name} onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                  </div>
                )}

                {paymentMethod === 'UPI' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">UPI ID</label>
                    <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)}
                      placeholder="you@upi"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
                    <p className="text-[10px] text-slate-600 mt-1.5">Enter your UPI ID to receive payment request</p>
                    <div className="mt-3 flex gap-2">
                      {['Google Pay', 'PhonePe', 'Paytm'].map(app => (
                        <span key={app} className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-lg">{app}</span>
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethod === 'NET_BANKING' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Select Bank</label>
                    <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none">
                      {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Yes Bank', 'PNB', 'BOB'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div>
                  <p className="text-sm text-slate-400">Total Amount</p>
                  <p className="text-2xl font-black text-emerald-400">{formatCurrency(totalAmount)}</p>
                </div>
                <button
                  onClick={handleProcessPayment}
                  className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-base rounded-xl transition"
                >
                  Pay {formatCurrency(totalAmount)}
                </button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 shadow-xl text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-6" />
              <h2 className="text-xl font-bold text-white mb-2">Processing Payment</h2>
              <p className="text-sm text-slate-400">Please wait while we process your transaction...</p>
              <div className="mt-6 space-y-2 text-xs text-slate-500 font-mono">
                <p className="text-emerald-400 animate-pulse">▸ Encrypting payment data</p>
                <p className="text-slate-600">▸ Connecting to payment gateway</p>
                <p className="text-slate-600">▸ Verifying transaction</p>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && result && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-8 shadow-xl text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Payment Successful!</h2>
                <p className="text-sm text-slate-400 mb-2">Transaction ID: <span className="font-mono text-emerald-400">{result.transactionId}</span></p>
                <p className="text-xs text-slate-500">Your fees have been paid successfully.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                <h3 className="text-sm font-semibold text-slate-200 mb-3">Payment Receipts</h3>
                <div className="space-y-2">
                  {result.results?.filter((r: any) => r.receiptUrl).map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between py-2 px-3 bg-slate-950 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(r.status)}
                        <span className="text-xs text-slate-300">{r.id.slice(0, 8)}...</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-emerald-400">{r.receiptUrl}</span>
                        <span className="text-[10px] text-slate-500 ml-2">{r.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Link href="/dashboard/student/fees" className="flex-1 text-center py-3 bg-slate-900 border border-slate-800 text-white font-medium rounded-xl hover:bg-slate-800 transition text-sm">
                  Back to Fees
                </Link>
                <button onClick={() => window.print()} className="flex-1 py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-600 transition text-sm">
                  Print Receipt
                </button>
              </div>
            </div>
          )}

          {/* Failed Step */}
          {step === 'failed' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-rose-500/30 rounded-xl p-8 shadow-xl text-center">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
                  <XCircle size={32} className="text-rose-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Payment Failed</h2>
                <p className="text-sm text-rose-400 mb-4">{errorMsg}</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('payment')} className="flex-1 py-3 bg-slate-900 border border-slate-800 text-white font-medium rounded-xl hover:bg-slate-800 transition text-sm">
                  Try Again
                </button>
                <Link href="/dashboard/student/fees" className="flex-1 text-center py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition text-sm">
                  Cancel
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </RoleGuard>
  );
}
