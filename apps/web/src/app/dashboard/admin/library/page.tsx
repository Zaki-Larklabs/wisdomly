'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BookOpen, Plus, Search, X, Trash2, Edit3, ArrowLeft, RotateCcw, Loader2, BookMarked, BookX } from 'lucide-react';

export default function AdminLibraryPage() {
  const [tab, setTab] = useState<'catalog' | 'borrows'>('catalog');
  const [books, setBooks] = useState<any[]>([]);
  const [borrows, setBorrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editBook, setEditBook] = useState<any>(null);
  const [borrowModal, setBorrowModal] = useState(false);
  const [form, setForm] = useState({ isbn: '', title: '', author: '', publisher: '', edition: '', category: '', description: '', quantity: 1, shelfLocation: '' });
  const [borrowForm, setBorrowForm] = useState({ bookId: '', borrowerId: '', borrowerRole: 'STUDENT', dueDate: '' });

  const fetchBooks = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      const r = await api.get('/library/books', { params });
      setBooks(r.data.data || []);
    } catch {}
  };

  const fetchBorrows = async () => {
    try {
      const r = await api.get('/library/borrows');
      setBorrows(r.data.data || []);
    } catch {}
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchBooks(), fetchBorrows()]);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  useEffect(() => { fetchBooks(); }, [search]);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/library/books', form);
      setShowAdd(false);
      setForm({ isbn: '', title: '', author: '', publisher: '', edition: '', category: '', description: '', quantity: 1, shelfLocation: '' });
      fetchBooks();
    } catch {}
  };

  const handleEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBook) return;
    try {
      await api.put(`/library/books/${editBook.id}`, form);
      setEditBook(null);
      setForm({ isbn: '', title: '', author: '', publisher: '', edition: '', category: '', description: '', quantity: 1, shelfLocation: '' });
      fetchBooks();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await api.delete(`/library/books/${id}`);
      fetchBooks();
    } catch {}
  };

  const openEdit = (book: any) => {
    setEditBook(book);
    setForm({
      isbn: book.isbn || '', title: book.title, author: book.author,
      publisher: book.publisher || '', edition: book.edition || '',
      category: book.category || '', description: book.description || '',
      quantity: book.quantity, shelfLocation: book.shelfLocation || ''
    });
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/library/borrow', borrowForm);
      setBorrowModal(false);
      setBorrowForm({ bookId: '', borrowerId: '', borrowerRole: 'STUDENT', dueDate: '' });
      loadAll();
    } catch {}
  };

  const handleReturn = async (id: string) => {
    try {
      await api.put(`/library/return/${id}`);
      loadAll();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen size={20} className="text-emerald-400" />
          <h1 className="text-xl font-bold text-white">Library Management</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
          {(['catalog', 'borrows'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition capitalize ${tab === t ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white'}`}>
              {t === 'catalog' ? '📚 Book Catalog' : '🔄 Borrows & Returns'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-24"><Loader2 size={24} className="animate-spin mx-auto text-slate-500" /></div>
        ) : tab === 'catalog' ? (
          <>
            <div className="flex justify-between items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, author, or ISBN..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/40" />
              </div>
              <button onClick={() => { setEditBook(null); setForm({ isbn: '', title: '', author: '', publisher: '', edition: '', category: '', description: '', quantity: 1, shelfLocation: '' }); setShowAdd(true); }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition">
                <Plus size={14} /> Add Book
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-semibold">Title</th>
                    <th className="text-left px-4 py-3 font-semibold">Author</th>
                    <th className="text-left px-4 py-3 font-semibold">ISBN</th>
                    <th className="text-center px-4 py-3 font-semibold">Qty</th>
                    <th className="text-center px-4 py-3 font-semibold">Available</th>
                    <th className="text-center px-4 py-3 font-semibold">Status</th>
                    <th className="text-right px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(book => (
                    <tr key={book.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{book.title}</p>
                        <p className="text-[10px] text-slate-500">{book.category || 'Uncategorized'}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{book.author}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{book.isbn || '—'}</td>
                      <td className="px-4 py-3 text-center font-mono">{book.quantity}</td>
                      <td className="px-4 py-3 text-center font-mono">
                        <span className={`font-bold ${book.availableCount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{book.availableCount}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${book.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {book.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => openEdit(book)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-blue-400"><Edit3 size={14} /></button>
                          <button onClick={() => handleDelete(book.id)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400"><Trash2 size={14} /></button>
                          {book.availableCount > 0 && (
                            <button onClick={() => { setBorrowForm({ ...borrowForm, bookId: book.id }); setBorrowModal(true); }}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-emerald-400"><BookMarked size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {books.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">No books found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-semibold">Book</th>
                    <th className="text-left px-4 py-3 font-semibold">Borrower</th>
                    <th className="text-left px-4 py-3 font-semibold">Role</th>
                    <th className="text-center px-4 py-3 font-semibold">Borrow Date</th>
                    <th className="text-center px-4 py-3 font-semibold">Due Date</th>
                    <th className="text-center px-4 py-3 font-semibold">Status</th>
                    <th className="text-right px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {borrows.map(b => (
                    <tr key={b.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{b.book?.title || 'Unknown'}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{b.borrowerId}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">{b.borrowerRole}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400 text-[11px]">{new Date(b.borrowDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[11px] font-mono font-bold ${new Date(b.dueDate) < new Date() && b.status === 'BORROWED' ? 'text-rose-400' : 'text-slate-400'}`}>
                          {new Date(b.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.status === 'BORROWED' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {b.status === 'BORROWED' && (
                          <button onClick={() => handleReturn(b.id)}
                            className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 ml-auto transition">
                            <RotateCcw size={12} /> Return
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {borrows.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">No borrow records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Book Modal */}
      {(showAdd || editBook) && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => { setShowAdd(false); setEditBook(null); }}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">{editBook ? 'Edit Book' : 'Add Book'}</h2>
              <button onClick={() => { setShowAdd(false); setEditBook(null); }} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={editBook ? handleEditBook : handleAddBook} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Title</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Author</label>
                  <input type="text" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">ISBN</label>
                  <input type="text" value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Publisher</label>
                  <input type="text" value={form.publisher} onChange={e => setForm({ ...form, publisher: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Edition</label>
                  <input type="text" value={form.edition} onChange={e => setForm({ ...form, edition: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                  <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Textbook, Reference"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Quantity</label>
                  <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} min={1}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Shelf Location</label>
                  <input type="text" value={form.shelfLocation} onChange={e => setForm({ ...form, shelfLocation: e.target.value })} placeholder="e.g. A-12"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none resize-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-sm transition">
                {editBook ? 'Update Book' : 'Add Book'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Borrow Modal */}
      {borrowModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setBorrowModal(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Borrow Book</h2>
              <button onClick={() => setBorrowModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleBorrow} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Borrower ID</label>
                <input type="text" value={borrowForm.borrowerId} onChange={e => setBorrowForm({ ...borrowForm, borrowerId: e.target.value })} required
                  placeholder="Student or Teacher ID"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Borrower Role</label>
                <select value={borrowForm.borrowerRole} onChange={e => setBorrowForm({ ...borrowForm, borrowerRole: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none">
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Due Date</label>
                <input type="date" value={borrowForm.dueDate} onChange={e => setBorrowForm({ ...borrowForm, dueDate: e.target.value })} required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none" />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-sm transition">
                Confirm Borrow
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
