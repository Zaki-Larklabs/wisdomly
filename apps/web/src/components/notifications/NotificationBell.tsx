'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, ExternalLink, Loader2 } from 'lucide-react';
import { useNotifications, useUnreadCount, useMarkRead } from '@/hooks/useNotifications';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: count = 0 } = useUnreadCount();
  const { data, isLoading } = useNotifications(1, 5, true);
  const markRead = useMarkRead();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    markRead.mutate([id]);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition text-slate-300 hover:text-white"
      >
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all
              <ExternalLink size={12} />
            </Link>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-slate-400" />
              </div>
            ) : !data?.notifications?.length ? (
              <div className="py-8 text-center text-slate-400 text-sm">All caught up! No new notifications.</div>
            ) : (
              data.notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 p-3 border-b border-slate-50 hover:bg-slate-50 transition group">
                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${n.isRead ? 'bg-transparent' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={(e) => handleMarkRead(e, n.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition text-slate-400 hover:text-slate-600"
                      title="Mark as read"
                    >
                      <CheckCheck size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
