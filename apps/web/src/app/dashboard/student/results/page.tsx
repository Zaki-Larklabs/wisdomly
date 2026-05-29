'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';

export default function StudentResults() {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // We assume the user.id resolves to the student's ID or the backend handles mapping
    fetch(`/api/v1/marks/student/${user.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('wisdomly_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setResults(data.data);
        }
        setLoading(false);
      });
  }, [user]);

  if (loading) return (
    <div className="p-8 flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Academic Results</h1>
        <p className="mt-2 text-gray-600">Track your performance across all examinations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {results.map((result: any) => (
            <div key={result.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow cursor-pointer">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{result.exam?.name || 'Exam'}</h3>
                  <p className="text-sm text-gray-500 mt-1">Generated: {new Date(result.generatedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-blue-600">{result.percentage.toFixed(1)}%</div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Overall Score</div>
                </div>
              </div>
              <div className="px-6 py-5 grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="text-sm font-medium text-blue-600 uppercase">Grade</div>
                  <div className="text-xl font-bold text-gray-900 mt-1">{result.grade || 'N/A'}</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-50 border border-green-100">
                  <div className="text-sm font-medium text-green-600 uppercase">Class Rank</div>
                  <div className="text-xl font-bold text-gray-900 mt-1">{result.rank ? `#${result.rank}` : 'N/A'}</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-100">
                  <div className="text-sm font-medium text-purple-600 uppercase">Total Marks</div>
                  <div className="text-xl font-bold text-gray-900 mt-1">{result.totalMarks}</div>
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-sm font-medium text-blue-600 group-hover:text-blue-700 flex justify-center">
                View Detailed Subject Breakdown
              </div>
            </div>
          ))}
          {results.length === 0 && (
            <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-sm text-gray-500">Your exam results will appear here once published.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Summary</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">Average Percentage</span>
                  <span className="font-bold text-gray-900">
                    {results.length > 0 
                      ? (results.reduce((acc, curr) => acc + curr.percentage, 0) / results.length).toFixed(1) + '%' 
                      : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${results.length > 0 ? (results.reduce((acc, curr) => acc + curr.percentage, 0) / results.length) : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">Latest Feedback</h4>
                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-yellow-800">
                  "Consistent improvement in mathematics. Needs more focus on science practicals." - Class Teacher
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
