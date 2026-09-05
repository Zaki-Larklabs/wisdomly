'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }
    api.get(`/payments/verify/${sessionId}`)
      .then(r => {
        setDetails(r.data.data);
        setStatus(r.data.data?.paymentStatus === 'paid' ? 'success' : 'error');
      })
      .catch(() => setStatus('error'));
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        {status === 'loading' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12">
            <Loader2 size={40} className="animate-spin mx-auto text-emerald-400 mb-4" />
            <h2 className="text-lg font-bold">Verifying Payment...</h2>
          </div>
        )}
        {status === 'success' && (
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-12">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Payment Successful!</h2>
            {details && (
              <p className="text-sm text-slate-400 mb-2">Amount: <span className="font-bold text-emerald-400">₹{details.amountTotal}</span></p>
            )}
            <p className="text-xs text-slate-500 mb-6">Transaction ID: {sessionId}</p>
            <Link href="/dashboard/student/fees" className="inline-block px-6 py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-600 transition">
              Back to Fees
            </Link>
          </div>
        )}
        {status === 'error' && (
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-12">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Payment Verification Failed</h2>
            <p className="text-sm text-slate-400 mb-6">{!sessionId ? 'No session ID provided.' : 'Could not verify payment status.'}</p>
            <Link href="/dashboard/student/fees" className="inline-block px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition">
              Back to Fees
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
