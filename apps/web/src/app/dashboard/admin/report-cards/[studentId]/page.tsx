'use client';

import React, { useEffect, useState } from 'react';

export default function AdminReportCardView({ params }: { params: { studentId: string } }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/marks/student/${params.studentId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('wisdomly_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setResults(data.data);
        }
        setLoading(false);
      });
  }, [params.studentId]);

  if (loading) return (
    <div className="p-8 flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Report Cards</h1>
        </div>
        <button 
          onClick={() => window.print()}
          className="px-5 py-2.5 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 shadow-sm transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Print Records
        </button>
      </div>

      <div className="space-y-12">
        {results.map((result: any) => (
          <div key={result.id} className="bg-white rounded-xl shadow-sm border border-gray-300 p-8 print:shadow-none print:border-gray-500">
            {/* Header / School Branding */}
            <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-widest">Wisdomly Academy</h2>
              <p className="text-gray-600 mt-1">Official Academic Transcript</p>
              <h3 className="text-xl font-bold text-gray-800 mt-4">{result.exam?.name || 'Examination Result'}</h3>
            </div>
            
            {/* Student Info */}
            <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
              <div>
                <p className="text-gray-500 uppercase tracking-wider text-xs font-semibold mb-1">Student ID</p>
                <p className="font-medium text-gray-900">{params.studentId}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase tracking-wider text-xs font-semibold mb-1">Date Issued</p>
                <p className="font-medium text-gray-900">{new Date(result.generatedAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Percentage</div>
                <div className="text-2xl font-black text-gray-900 mt-1">{result.percentage.toFixed(1)}%</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Grade</div>
                <div className="text-2xl font-black text-gray-900 mt-1">{result.grade || 'N/A'}</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Class Rank</div>
                <div className="text-2xl font-black text-gray-900 mt-1">{result.rank ? result.rank : 'N/A'}</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Marks</div>
                <div className="text-2xl font-black text-gray-900 mt-1">{result.totalMarks}</div>
              </div>
            </div>

            {/* Footer / Signatures */}
            <div className="mt-16 flex justify-between items-end border-t border-gray-200 pt-8">
              <div className="w-48 text-center">
                <div className="border-b border-gray-400 h-8 mb-2"></div>
                <p className="text-sm font-medium text-gray-600">Class Teacher</p>
              </div>
              <div className="w-48 text-center">
                <div className="border-b border-gray-400 h-8 mb-2"></div>
                <p className="text-sm font-medium text-gray-600">Principal</p>
              </div>
            </div>
          </div>
        ))}
        {results.length === 0 && (
          <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            No report cards generated yet for this student.
          </div>
        )}
      </div>
    </div>
  );
}
