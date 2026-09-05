'use client';

import React, { useEffect, useState } from 'react';
import { RoleGuard } from '@/components/ui/layouts/RoleGuard';
import { api } from '@/lib/api';
import { BookOpen, Search, Loader2, BookMarked, BookX, Calendar } from 'lucide-react';

export default function TeacherLibraryPage() {
  const [tab, setTab] = useState<'browse' | 'my-borrows'>('browse');
  const [books, setBooks] = useState<any[]>([]);
  const [myBorrows, setMyBorrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      const [booksRes, borrowsRes] = await Promise.all([
        api.get('/library/books', { params }),
        api.get('/library/my-borrows')
      ]);
      setBooks(booksRes.data.data || []);
      setMyBorrows(borrowsRes.data.data || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchData(); }, [search]);

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <RoleGuard allowedRoles={['TEACHER']}>
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Library</h1>
          </div>

          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
            {(['browse', 'my-borrows'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition capitalize ${tab === t ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white'}`}>
                {t === 'browse' ? '📚 Browse Books' : '📖 My Borrowed Books'}
              </button>
            ))}
          </div>

          {tab === 'browse' && (
            <div className="relative max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/40" />
            </div>
          )}

          {loading ? (
            <div className="text-center py-24"><Loader2 size={24} className="animate-spin mx-auto text-slate-500" /></div>
          ) : tab === 'browse' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map(book => (
                <div key={book.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <BookOpen size={22} className="text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{book.title}</p>
                      <p className="text-[10px] text-slate-400">{book.author}</p>
                      {book.isbn && <p className="text-[9px] text-slate-600 font-mono mt-0.5">ISBN: {book.isbn}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/50">
                    <div className="flex items-center gap-2">
                      {book.availableCount > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                          {book.availableCount} available
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400">Out of stock</span>
                      )}
                      <span className="text-[10px] text-slate-600">{book.category || ''}</span>
                    </div>
                  </div>
                </div>
              ))}
              {books.length === 0 && (
                <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                  <BookOpen size={40} className="mx-auto text-slate-700 mb-3" />
                  <p className="text-slate-400">No books found in the catalog.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {myBorrows.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                  <BookX size={40} className="mx-auto text-slate-700 mb-3" />
                  <p className="text-slate-400">You haven't borrowed any books yet.</p>
                </div>
              ) : (
                myBorrows.map(b => (
                  <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                        <BookMarked size={18} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{b.book?.title || 'Unknown Book'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.status === 'BORROWED' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {b.status}
                          </span>
                          <span className={`text-[10px] flex items-center gap-1 ${isOverdue(b.dueDate) && b.status === 'BORROWED' ? 'text-rose-400' : 'text-slate-400'}`}>
                            <Calendar size={10} /> Due: {new Date(b.dueDate).toLocaleDateString()}
                          </span>
                          {b.returnedDate && (
                            <span className="text-[10px] text-slate-500">Returned: {new Date(b.returnedDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isOverdue(b.dueDate) && b.status === 'BORROWED' && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400">OVERDUE</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
