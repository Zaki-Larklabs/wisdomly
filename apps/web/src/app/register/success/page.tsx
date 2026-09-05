'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, ArrowLeft, Sparkles } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'user';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0C0A09] selection:bg-emerald-500/30">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-3xl p-8 overflow-hidden text-center" style={{ background: 'rgba(20, 18, 16, 0.65)', backdropFilter: 'blur(40px) saturate(2)', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-emerald-400" />
          </div>

          <h1 className="text-2xl text-white mb-2" style={{ fontFamily: 'var(--w-font-display, "Instrument Serif", serif)' }}>
            Registration Submitted!
          </h1>
          <p className="text-sm text-white/50 mb-8">
            Your {role} account has been created and is pending approval. You'll be notified once an administrator activates your account.
          </p>

          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl px-5 py-4 mb-8 text-left">
            <p className="text-xs text-white/40 flex items-center gap-2">
              <Sparkles size={12} className="text-emerald-400 shrink-0" />
              Please check your email/notifications for approval status. Contact your school administrator if you don't hear back.
            </p>
          </div>

          <Link href="/login" className="inline-flex items-center gap-2 py-3 px-8 rounded-xl text-sm font-bold text-white transition bg-emerald-600 hover:bg-emerald-500">
            <ArrowLeft size={16} /> Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0C0A09]">
        <Loader2 size={32} className="animate-spin text-white/30" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
