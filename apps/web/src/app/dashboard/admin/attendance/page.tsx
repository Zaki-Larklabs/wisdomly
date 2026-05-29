'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminAttendanceReport() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/classes', {
      headers: { Authorization: `Bearer ${localStorage.getItem('wisdomly_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setClasses(data.data);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="p-8 flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Attendance Reports</h1>
          <p className="mt-2 text-gray-600">View overall school attendance metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-green-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Today's Attendance</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">94.2%</p>
          <p className="mt-1 text-sm text-green-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            1.2% from yesterday
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-red-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Absences</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">42</p>
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
            5 more than yesterday
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Registers</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">3</p>
          <p className="mt-1 text-sm text-gray-600 flex items-center">
            Classes not marked yet
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Class-wise Overview</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {classes.map(cls => (
              <tr key={cls.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Grade {cls.gradeLevel}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <span className="mr-2">95%</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[95%]"></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full border border-green-200">
                    Marked
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                  <Link href={`/dashboard/admin/attendance/${cls.id}`} className="text-blue-600 hover:text-blue-900">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
            {classes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                  No classes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
