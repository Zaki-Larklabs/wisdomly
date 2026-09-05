'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, Users, ArrowRight, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0C0A09] selection:bg-indigo-500/30">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="rounded-3xl p-8 overflow-hidden" style={{ background: 'rgba(20, 18, 16, 0.65)', backdropFilter: 'blur(40px) saturate(2)', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #10B981, #10B98188)' }}>
              <Sparkles size={18} color="white" strokeWidth={2} />
            </div>
            <div>
              <p className="font-semibold text-sm text-white tracking-tight">Wisdomly OS</p>
              <p className="text-xs text-white/40">Create Your Account</p>
            </div>
          </div>

          <h1 className="text-3xl text-white mb-2" style={{ fontFamily: 'var(--w-font-display, "Instrument Serif", serif)' }}>Join Wisdomly</h1>
          <p className="text-sm text-white/50 mb-8">Select your role to get started</p>

          <div className="space-y-4">
            <Link href="/register/student" className="group flex items-center gap-4 w-full px-5 py-5 rounded-2xl transition-all" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#10B98120' }}>
                <GraduationCap size={24} color="#10B981" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-semibold">I'm a Student</p>
                <p className="text-xs text-white/40">Register with your roll number and class</p>
              </div>
              <ArrowRight size={18} className="text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link href="/register/parent" className="group flex items-center gap-4 w-full px-5 py-5 rounded-2xl transition-all" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#F59E0B20' }}>
                <Users size={24} color="#F59E0B" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-semibold">I'm a Parent</p>
                <p className="text-xs text-white/40">Register to track your child's progress</p>
              </div>
              <ArrowRight size={18} className="text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-white/40">Already have an account? <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
