'use client';

import React, { useEffect, useState } from 'react';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';
import { api } from '@/lib/api';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

export default function StudentMessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchConversations = () => {
    api.get('/messages/conversations').then(r => setConversations(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchConversations(); }, []);

  const openConversation = async (otherUserId: string) => {
    setActiveConv(otherUserId);
    const { data } = await api.get(`/messages/conversations/${otherUserId}`);
    setMessages(data.data);
  };

  const handleSend = async () => {
    if (!content.trim() || !activeConv) return;
    setSending(true);
    try {
      await api.post('/messages', { receiverId: activeConv, content });
      setContent('');
      openConversation(activeConv);
      fetchConversations();
    } catch {}
    setSending(false);
  };

  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-slate-950 text-white flex">
        <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-emerald-400" />
              <h2 className="font-bold text-white text-sm">Messages</h2>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center"><Loader2 size={16} className="animate-spin mx-auto text-slate-500" /></div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-600">No conversations yet.</div>
            ) : (
              conversations.map((c: any) => (
                <button key={c.userId} onClick={() => openConversation(c.userId)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/50 transition ${activeConv === c.userId ? 'bg-slate-800' : ''}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">U</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{c.userId.slice(0, 8)}...</p>
                      <p className="text-[10px] text-slate-500 truncate">{c.lastMessage}</p>
                    </div>
                    {c.unread > 0 && <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{c.unread}</span>}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>
        <main className="flex-1 flex flex-col">
          {activeConv ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m: any, i: number) => (
                  <div key={m.id || i} className={`flex ${m.sender?.id === activeConv ? '' : 'justify-end'}`}>
                    <div className={`max-w-[70%] rounded-xl px-4 py-2 text-sm ${m.sender?.id === activeConv ? 'bg-slate-800 text-slate-200' : 'bg-blue-600 text-white'}`}>
                      <p>{m.content}</p>
                      <p className="text-[10px] opacity-60 mt-1">{new Date(m.sentAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-800 p-4 flex gap-2">
                <input type="text" value={content} onChange={e => setContent(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
                <button onClick={handleSend} disabled={sending || !content.trim()}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition disabled:opacity-50">
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-600">
              <div className="text-center">
                <MessageSquare size={40} className="mx-auto mb-3 text-slate-700" />
                <p className="text-sm">Select a conversation</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </RoleGuard>
  );
}
