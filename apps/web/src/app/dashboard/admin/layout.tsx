'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { RoleGuard } from '../../../components/ui/layouts/RoleGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const pathname = usePathname();

  // Helper function to apply active styles based on current router state
  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: 'Control Overview', href: '/dashboard/admin', icon: '📊' },
    { name: 'Academic Structure', href: '/dashboard/admin/classes', icon: '🏫' },
    { name: 'Course Management', href: '/dashboard/admin/subjects', icon: '📚' }, // <-- New link node injected here
    { name: 'Student Registry', href: '/dashboard/admin/students', icon: '🎓' },
    { name: 'Teacher Roster', href: '/dashboard/admin/teachers', icon: '💼' },
  ];

  return (
    <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-slate-950 flex text-white">
        
        {/* Persistent Desktop Sidebar Drawer */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0">
          <div className="space-y-6">
            <div className="px-3 py-2 border-b border-slate-800/60 pb-4">
              <h2 className="text-xl font-bold text-emerald-400 tracking-wide">Wisdomly OS</h2>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-0.5">School Admin Suite</p>
            </div>

            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                    isActive(link.href)
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Core Sign-Out Command Deck */}
          <div className="border-t border-slate-800/60 pt-4">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg text-sm font-medium transition group"
            >
              <span className="text-base group-hover:scale-110 transition">🚪</span>
              Terminate Session
            </button>
          </div>
        </aside>

        {/* Fluid Dynamic Workspace Window */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {children}
        </main>

      </div>
    </RoleGuard>
  );
}