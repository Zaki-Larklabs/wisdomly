'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';
import NotificationBell from '@/components/notifications/NotificationBell';
import { LayoutDashboard, Users, DollarSign, LogOut } from 'lucide-react';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const links = [
    { name: 'Dashboard', href: '/dashboard/parent', icon: LayoutDashboard },
    { name: 'My Children', href: '/dashboard/parent/children', icon: Users },
    { name: 'Fees', href: '/dashboard/parent/fees', icon: DollarSign },
  ];

  return (
    <RoleGuard allowedRoles={['PARENT']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0">
          <div className="space-y-6">
            <div className="px-3 py-2 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-amber-500 tracking-wide">Wisdomly</h2>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-0.5">Parent Portal</p>
            </div>
            <nav className="space-y-1">
              {links.map(link => (
                <Link key={link.href} href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                    isActive(link.href) ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                  }`}>
                  <link.icon size={16} />
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-medium transition">
            <LogOut size={16} /> Sign Out
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-2 flex justify-end items-center">
            <NotificationBell />
          </div>
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
