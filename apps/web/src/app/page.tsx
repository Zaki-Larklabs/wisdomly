import Link from 'next/link';
import { GraduationCap, ArrowRight, BookOpen, Users, Bell, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Decorative background grid and glowing circles */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      
      {/* Top Left Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] pointer-events-none" />
      
      {/* Bottom Right Glow */}
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-800/80 backdrop-blur-md bg-slate-950/50 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-emerald-400">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Wisdomly
            </span>
          </div>
          
          <Link
            href="/login"
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 transition text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] duration-200"
          >
            Access Portal
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-4xl w-full text-center space-y-8">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800/80 rounded-full px-4 py-1.5 text-xs text-slate-400 shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Next-Gen Learning Management & Multi-Tenant Portal
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none text-white max-w-3xl mx-auto">
            Elevate Learning with{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Wisdomly
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A beautiful, unified enterprise-grade multi-tenant platform for tracking coursework, real-time notices, secure assignments, and academic success.
          </p>

          {/* Core Interactive Action Card */}
          <div className="max-w-lg mx-auto bg-slate-900/60 border border-slate-800 backdrop-blur-md rounded-2xl p-8 shadow-2xl space-y-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
            {/* Hover card border shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Ready to explore?</h3>
              <p className="text-sm text-slate-400">
                Log in to access your customized dashboard based on your role.
              </p>
            </div>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 transition-all duration-300 text-slate-950 font-bold py-3.5 px-6 rounded-xl text-md shadow-[0_4px_20px_rgba(16,185,129,0.15)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:translate-y-0 duration-200 animate-bounce-subtle"
            >
              Sign In to Your Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-500/80" /> Role-Based Access
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-500/80" /> Multi-Tenant Secure
              </span>
            </div>
          </div>

          {/* Quick features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 text-left hover:bg-slate-900/60 transition duration-300">
              <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-lg w-fit mb-4">
                <Users className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-white mb-1.5 text-sm">Role Dashboards</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tailored system views for Administrators, Instructors, and Students.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 text-left hover:bg-slate-900/60 transition duration-300">
              <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-lg w-fit mb-4">
                <BookOpen className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-white mb-1.5 text-sm">Coursework & Homework</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Set deadlines, manage files, and grade academic milestones dynamically.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 text-left hover:bg-slate-900/60 transition duration-300">
              <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-lg w-fit mb-4">
                <Bell className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-white mb-1.5 text-sm">Instant Notices</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ensure timely communications across departments with clean noticeboard UI.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 bg-slate-950/80">
        <p>&copy; {new Date().getFullYear()} Wisdomly Learning Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}