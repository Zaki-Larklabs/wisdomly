'use client';

import React, { useEffect } from 'react';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log exception telemetry metadata to administrative channels
    console.error('WISDOMLY_CORE_ENGINE_UNHANDLED_EXCEPTION:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4 relative overflow-hidden">
      
      {/* Decorative Radial Background Atmosphere */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-rose-500/5 blur-[150px] pointer-events-none" />

      {/* Glassmorphic Maintenance Panel */}
      <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-lg rounded-2xl p-10 max-w-lg w-full shadow-2xl text-center space-y-6 relative z-10">
        
        {/* Animated System Alert Badge */}
        <div className="mx-auto w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-400 text-3xl shadow-inner animate-pulse">
          ⚡
        </div>

        {/* Textual Feedback and Telemetry Context */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            System Connection Interrupted
          </h1>
          <p className="text-[10px] text-rose-400/80 font-mono tracking-widest uppercase">
            ERR_DATABASE_COMM_FAILURE
          </p>
          <p className="text-slate-400 text-sm leading-relaxed pt-2">
            The platform is unable to synchronize with the Wisdomly Cloud Engine. This may be due to active server maintenance or database provisioning limits.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-slate-500 pt-1">
              Telemetry Digest: {error.digest}
            </p>
          )}
        </div>

        {/* Action Command Console */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs py-3 rounded-xl transition duration-300 transform active:scale-[0.98] shadow-lg shadow-emerald-500/10"
          >
            RE-ESTABLISH HANDSHAKE
          </button>
          <a
            href="/login"
            className="flex-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl transition duration-300 flex items-center justify-center"
          >
            RETURN TO SAFE LOGIN
          </a>
        </div>

      </div>

    </div>
  );
}
