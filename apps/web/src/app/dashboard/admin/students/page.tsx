'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';
import { RoleGuard } from '../../../../components/ui/layouts/RoleGuard';

interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  gender: string;
  class: { name: string };
  section: { name: string };
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [csvInput, setCsvInput] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch current school roster from Neon cloud database
  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data.data);
    } catch (err) {
      console.error('Failed to pull student registers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 2. Handle CSV string processing upload
  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvInput.trim()) return;
    setSubmitting(true);
    setImportMessage('');

    try {
      const response = await api.post('/students/import', { csvData: csvInput });
      setImportMessage(`🎉 Successfully imported ${response.data.data.totalImported} students!`);
      setCsvInput('');
      fetchStudents(); // Refresh data table entries
    } catch (err: any) {
      setImportMessage(`❌ Error: ${err.response?.data?.error?.message || 'Processing aborted'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-3xl font-bold text-emerald-400">Student Control Registry</h1>
              <p className="text-slate-400 text-sm">Manage tenant records and high-volume batch data streaming.</p>
            </div>
            <a href="/dashboard/admin" className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-700 transition">
              ← Back to Main Profile
            </a>
          </div>

          {/* Bulk Importer Section Component Grid Layout */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-2 text-slate-200">High-Volume CSV Upload Engine</h2>
            <p className="text-xs text-slate-400 mb-4">Paste comma-separated rows matching your database tables schema formatting rules.</p>
            
            <form onSubmit={handleBulkImport} className="space-y-3">
              <textarea
                rows={4}
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="email,rollNumber,name,gender,dob,classId,sectionId&#10;example@school.edu,10A004,John Doe,MALE,2010-01-01,YOUR_CLASS_ID,YOUR_SECTION_ID"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
              />
              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2 px-5 rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Streaming Records...' : 'Execute Batch Processing'}
                </button>
                {importMessage && <span className="text-xs font-medium">{importMessage}</span>}
              </div>
            </form>
          </div>

          {/* Roster Database Table Display Screen */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-slate-200">Active School Roster</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-emerald-400 tracking-wider">HYDRATING TENANT REGISTRY DATA MATRIX...</div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No student identity indexes discovered for this school token environment space.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-xs uppercase text-slate-400 tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-3.5">Roll No.</th>
                      <th className="px-6 py-3.5">Full Name</th>
                      <th className="px-6 py-3.5">Email Identity Path</th>
                      <th className="px-6 py-3.5">Allocated Grade / Section</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-750/30 transition">
                        <td className="px-6 py-4 font-mono font-bold text-emerald-400">{student.rollNumber}</td>
                        <td className="px-6 py-4 font-medium text-white">{student.name}</td>
                        <td className="px-6 py-4 text-slate-400 text-xs">{student.email}</td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-900 border border-slate-700 text-slate-300 text-[11px] px-2.5 py-1 rounded-md font-semibold">
                            {student.class?.name || 'Class 10'} — {student.section?.name || 'A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </RoleGuard>
  );
}