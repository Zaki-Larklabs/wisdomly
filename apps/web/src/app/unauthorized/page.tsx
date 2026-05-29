'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleReturn = () => {
    // Check role or go back to login
    const roleCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('wisdomly_role='))
      ?.split('=')[1];

    if (roleCookie === 'ADMIN' || roleCookie === 'SUPER_ADMIN') {
      router.push('/dashboard/admin');
    } else if (roleCookie === 'TEACHER') {
      router.push('/dashboard/teacher');
    } else if (roleCookie === 'STUDENT') {
      router.push('/dashboard/student');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4 relative overflow-hidden">
      
      {/* Decorative Neon Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-rose-500/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none animate-pulse" />

      {/* Main Glassmorphic Feedback Container */}
      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-2xl p-10 max-w-md w-full shadow-2xl text-center space-y-6 relative z-10 hover:border-slate-700/60 transition duration-500">
        
        {/* Warning Icon Badge Node */}
        <div className="mx-auto w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-400 text-3xl shadow-inner shadow-rose-950/20">
          ⚠️
        </div>

        {/* Text Details Block */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Scope Verification Failed
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Error Code: 403_ACCESS_DENIED
          </p>
          <p className="text-sm text-slate-400 leading-relaxed pt-2">
            Your current security context does not contain the required permission policy matrix to access this administrative node.
          </p>
        </div>

        {/* Interactive Action Command Deck */}
        <div className="pt-4">
          <button
            onClick={handleReturn}
            className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all duration-300 transform active:scale-[0.98] shadow-lg shadow-rose-500/20"
          >
            RESOLVE CONTEXT & RETURN
          </button>
        </div>

      </div>

    </div>
  );
}
