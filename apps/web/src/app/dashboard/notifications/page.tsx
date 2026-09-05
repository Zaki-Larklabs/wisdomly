'use client';

import React, { useState } from 'react';
import { Bell, CheckCheck, Loader2, ArrowLeft, Filter, Trash2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useNotifications, useUnreadCount, useMarkRead, useMarkAllRead } from '@/hooks/useNotifications';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const typeColors: Record<string, string> = {
  FEE: 'bg-emerald-100 text-emerald-700',
  ATTENDANCE: 'bg-blue-100 text-blue-700',
  MARKS: 'bg-amber-100 text-amber-700',
  HOMEWORK: 'bg-purple-100 text-purple-700',
  ANNOUNCEMENT: 'bg-rose-100 text-rose-700',
  MESSAGE: 'bg-indigo-100 text-indigo-700',
  SYSTEM: 'bg-slate-100 text-slate-700',
};

const typeIcons: Record<string, string> = {
  FEE: '💰',
  ATTENDANCE: '✅',
  MARKS: '📝',
  HOMEWORK: '📚',
  ANNOUNCEMENT: '📢',
  MESSAGE: '💬',
  SYSTEM: '⚙️',
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data, isLoading } = useNotifications(page, 20, unreadOnly);
  const { data: unreadCount } = useUnreadCount();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const notifications = data?.notifications ?? [];
  const pagination = data?.pagination;

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 rounded-lg hover:bg-white/60 transition text-slate-500">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Bell size={24} className="text-blue-600" />
                Notifications
              </h1>
              <p className="text-sm text-slate-500">
                {unreadCount !== undefined ? `${unreadCount} unread` : 'Loading...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUnreadOnly(!unreadOnly)}
              className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg border transition ${
                unreadOnly
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <Filter size={14} />
              Unread only
            </button>
            <button
              onClick={handleMarkAllRead}
              disabled={!unreadCount || unreadCount === 0}
              className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg bg-white text-slate-600 border border-slate-200 hover:border-slate-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 size={14} />
              Mark all read
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-slate-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-4">
              🔔
            </div>
            <h2 className="text-lg font-bold text-slate-900">No notifications yet</h2>
            <p className="text-sm text-slate-500 mt-1">
              {unreadOnly ? 'No unread notifications. Try clearing the filter.' : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`bg-white rounded-xl border p-4 flex items-start gap-4 transition hover:shadow-sm ${
                  n.isRead ? 'border-slate-200' : 'border-blue-200 bg-blue-50/30'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg shrink-0">
                  {typeIcons[n.type] || '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${typeColors[n.type] || 'bg-slate-100 text-slate-600'}`}>
                      {n.type}
                    </span>
                    {!n.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                    <span className="text-[11px] text-slate-400 ml-auto">{timeAgo(n.createdAt)}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                  {Boolean(n.metadata?.receiptUrl) && (
                    <p className="text-[10px] text-emerald-600 font-mono mt-1">
                      Receipt: {String((n.metadata as Record<string, unknown>)?.receiptUrl ?? '')}
                    </p>
                  )}
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => markRead.mutate([n.id])}
                    className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-400 hover:text-slate-600 shrink-0"
                    title="Mark as read"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 text-sm font-bold rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-slate-300 transition disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-slate-500">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-sm font-bold rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-slate-300 transition disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
