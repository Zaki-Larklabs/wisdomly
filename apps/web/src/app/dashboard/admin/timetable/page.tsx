'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminTimetableManager() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/classes', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Timetable Management</h1>
          <p className="mt-2 text-gray-600">Select a class to view or edit its weekly schedule.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls: any) => (
          <Link key={cls.id} href={`/dashboard/admin/timetable/${cls.id}`}>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {cls.name}
                </h3>
                <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium border border-blue-100">
                  Grade {cls.gradeLevel}
                </span>
              </div>
              <div className="mt-6 flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                Manage Schedule 
                <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </div>
            </div>
          </Link>
        ))}
        {classes.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No classes</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new class.</p>
          </div>
        )}
      </div>
    </div>
  );
}
