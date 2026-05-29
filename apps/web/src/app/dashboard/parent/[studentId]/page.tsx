'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ChildOverview({ params }: { params: { studentId: string } }) {
  const [results, setResults] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<{ present: number; total: number }>({ present: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Results and Attendance for the specific child
    Promise.all([
      fetch(`/api/v1/marks/student/${params.studentId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('wisdomly_token')}` } }).then(r => r.json()),
      // Getting attendance for the current month as a quick overview
      fetch(`/api/v1/attendance/student/${params.studentId}?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`, { headers: { Authorization: `Bearer ${localStorage.getItem('wisdomly_token')}` } }).then(r => r.json())
    ]).then(([resultsData, attendanceData]) => {
      if (resultsData.success) {
        setResults(resultsData.data);
      }
      if (attendanceData.success) {
        const records = attendanceData.data;
        const present = records.filter((r: any) => r.status === 'PRESENT').length;
        setAttendanceStats({ present, total: records.length || 1 }); // prevent div by zero
      }
      setLoading(false);
    });
  }, [params.studentId]);

  if (loading) return (
    <div className="p-8 flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const attendancePercentage = attendanceStats.total > 0 
    ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
    : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Child Overview</h1>
          <p className="mt-2 text-gray-600">Academic and attendance summary.</p>
        </div>
        <Link 
          href="/dashboard/parent"
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Attendance Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">This Month's Attendance</h3>
            <p className="text-sm text-gray-500 mb-6">Overview of classes attended vs total classes held.</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                <circle 
                  cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - attendancePercentage / 100)}`}
                  className={`${attendancePercentage >= 75 ? 'text-green-500' : 'text-red-500'} transition-all duration-1000`} 
                />
              </svg>
              <span className="absolute text-xl font-bold text-gray-800">{attendancePercentage}%</span>
            </div>
            <div>
              <div className="text-sm text-gray-600"><span className="font-bold text-gray-900">{attendanceStats.present}</span> Present Sessions</div>
              <div className="text-sm text-gray-600 mt-1"><span className="font-bold text-gray-900">{attendanceStats.total - attendanceStats.present}</span> Missed Sessions</div>
            </div>
          </div>
        </div>

        {/* Latest Exam Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Latest Examination</h3>
            <p className="text-sm text-gray-500 mb-6">Performance in the most recent assessment.</p>
          </div>
          {results.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800">{results[0].exam?.name || 'Exam'}</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">Grade {results[0].grade}</span>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-2">{results[0].percentage.toFixed(1)}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${results[0].percentage}%` }}></div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 italic">No exam results published yet.</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Academic History</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {results.map((result: any) => (
              <tr key={result.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.exam?.name || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(result.generatedAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{result.percentage.toFixed(1)}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded border border-green-200 font-bold">
                    {result.grade}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-600">
                  {result.rank ? `#${result.rank}` : '-'}
                </td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                  No academic history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
