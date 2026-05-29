'use client';

import React, { useEffect } from 'react';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log scoped view exceptions for analytics
    console.error('WISDOMLY_DASHBOARD_VIEW_EXCEPTION:', error);
  }, [error]);

  return (
    <div className="p-8 space-y-6 bg-slate-950 min-h-screen text-white flex flex-col justify-center items-center relative overflow-hidden">
      
      {/* Radiant Glow Node */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      {/* Sleek Workspace Recovery Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full shadow-2xl text-center space-y-5 relative z-10 hover:border-slate-800 transition">
        
        <div className="mx-auto w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 text-2xl shadow-inner animate-pulse">
          📡
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-200">Workspace Node Offline</h2>
          <p className="text-[9px] text-emerald-400 font-mono tracking-wider uppercase">
            ERR_WORKSPACE_DESYNC
          </p>
          <p className="text-xs text-slate-400 leading-relaxed pt-1.5">
            This workspace module experienced a telemetry desynchronization state. The persistent side navigation remains fully secure and operational.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => reset()}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2.5 rounded-lg transition duration-300 transform active:scale-[0.98]"
          >
            SYNCHRONIZE WORKSPACE
          </button>
        </div>

      </div>

    </div>
  );
}
