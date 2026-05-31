'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, BookOpen, ClipboardList,
  BarChart3, CreditCard, Bell, Settings,
  ChevronLeft, GraduationCap, Calendar, FileText,
  MessageSquare, Shield, Menu, Sparkles,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  roles: string[];
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard, roles: ['ADMIN'], group: 'main' },
  { label: 'Dashboard', href: '/dashboard/teacher', icon: LayoutDashboard, roles: ['TEACHER'], group: 'main' },
  { label: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard, roles: ['STUDENT'], group: 'main' },
  
  { label: 'Students', href: '/dashboard/admin/students', icon: Users, roles: ['ADMIN'], group: 'academic' },
  { label: 'Teachers', href: '/dashboard/admin/teachers', icon: GraduationCap, roles: ['ADMIN'], group: 'academic' },
  { label: 'Classes', href: '/dashboard/admin/classes', icon: BookOpen, roles: ['ADMIN'], group: 'academic' },
  { label: 'Timetable', href: '/dashboard/admin/timetable', icon: Calendar, roles: ['ADMIN'], group: 'academic' },
  { label: 'Timetable', href: '/dashboard/teacher/timetable', icon: Calendar, roles: ['TEACHER'], group: 'academic' },
  { label: 'Timetable', href: '/dashboard/student/timetable', icon: Calendar, roles: ['STUDENT'], group: 'academic' },
  
  { label: 'Attendance', href: '/dashboard/admin/attendance', icon: ClipboardList, roles: ['ADMIN'], group: 'operations' },
  { label: 'Attendance', href: '/dashboard/teacher/attendance', icon: ClipboardList, roles: ['TEACHER'], group: 'operations' },
  { label: 'Marks', href: '/dashboard/admin/marks', icon: BarChart3, roles: ['ADMIN'], group: 'operations' },
  { label: 'Fees', href: '/dashboard/admin/fees', icon: CreditCard, roles: ['ADMIN'], group: 'operations' },
  { label: 'Fees', href: '/dashboard/student/fees', icon: CreditCard, roles: ['STUDENT'], group: 'operations' },

  { label: 'Messages', href: '/dashboard/teacher/messages', icon: MessageSquare, roles: ['TEACHER'], group: 'comms' },
  { label: 'Settings', href: '/settings', icon: Settings, roles: ['ADMIN', 'TEACHER', 'STUDENT'], group: 'settings' },
];

export default function Sidebar({ role, userName, schoolName, unreadCount = 0 }: any) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredItems = NAV_ITEMS.filter(item => item.roles.includes(role));
  
  const groups = filteredItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const g = item.group || 'main';
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Premium Spring Physics for interactions
  const springConfig = { type: "spring", stiffness: 300, damping: 25, mass: 0.5 } as const;

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-[200] bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-[201] p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md md:hidden"
      >
        <Menu size={18} className="text-white" />
      </button>

      <motion.aside
        animate={{ width: collapsed ? 80 : 280 }}
        transition={springConfig}
        className={cn(
          'fixed left-0 top-0 h-full z-[300] flex flex-col',
          'border-r border-white/5 bg-[#0a0a0a]/80 backdrop-blur-3xl',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'transition-transform duration-300 ease-out md:transition-none'
        )}
        style={{ boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.03)' }}
      >
        {/* Header - Brand Mark */}
        <div className="flex items-center gap-4 px-6 py-8">
          <motion.div 
            layout
            className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #6366F1, #4338CA)' }}
          >
            <div className="absolute inset-0 bg-white/20 blur-md translate-y-full hover:translate-y-0 transition-transform" />
            <Sparkles size={18} color="white" strokeWidth={2} className="relative z-10" />
          </motion.div>

          <AnimatePresence mode="popLayout">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 min-w-0"
              >
                <p className="font-semibold text-base text-white tracking-tight">Wisdomly OS</p>
                <p className="text-xs text-white/40 truncate">{schoolName || 'Enterprise'}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 space-y-6 scrollbar-hide">
          {Object.entries(groups).map(([groupKey, items]) => (
            <div key={groupKey} className="relative">
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/30"
                >
                  {groupKey}
                </motion.p>
              )}

              <div className="space-y-1">
                {items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link key={item.href} href={item.href} className="block relative">
                      {/* Fluid Active Background Pill */}
                      {isActive && (
                        <motion.div
                          layoutId="active-nav-pill"
                          className="absolute inset-0 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
                          initial={false}
                          transition={springConfig}
                        />
                      )}

                      <motion.div
                        whileHover={{ scale: 0.98, x: collapsed ? 0 : 4 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          'relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer z-10',
                          isActive ? 'text-indigo-400' : 'text-white/50 hover:text-white/90',
                          collapsed && 'justify-center px-0'
                        )}
                      >
                        <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
                        
                        {!collapsed && (
                          <span className="text-sm font-medium tracking-wide truncate flex-1">
                            {item.label}
                          </span>
                        )}

                        {!collapsed && item.badge && item.badge > 0 && (
                          <span className="flex-shrink-0 min-w-[20px] h-[20px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center px-1.5 shadow-lg shadow-rose-500/30">
                            {item.badge}
                          </span>
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer & Collapse Toggle */}
        <div className="p-4 border-t border-white/5">
          <div className={cn("flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5", collapsed && "justify-center")}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-lg">
              {userName?.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-[11px] text-white/40 uppercase tracking-wider">{role}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mt-4 w-full flex items-center justify-center py-2 text-white/30 hover:text-white/70 transition-colors"
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={springConfig}>
              <ChevronLeft size={16} />
            </motion.div>
          </button>
        </div>
      </motion.aside>
    </>
  );
}