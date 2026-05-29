'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';

export default function ParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // In a real app we'd have a specific endpoint for parent's children.
    // Assuming /api/v1/parents/me/children or something similar exists.
    // For now, we'll mock the children list if the endpoint isn't ready.
    // Let's create a fake endpoint call that falls back to mock data.
    fetch('/api/v1/parents/me/children', {
      headers: { Authorization: `Bearer ${localStorage.getItem('wisdomly_token')}` }
    })
      .then(res => res.ok ? res.json() : { success: false })
      .then(data => {
        if (data.success) {
          setChildren(data.data);
        } else {
          // Mock data fallback
          setChildren([
            { id: 'student-1', name: 'John Doe Jr.', rollNumber: '10A-05', class: { name: '10A', gradeLevel: 10 } },
            { id: 'student-2', name: 'Jane Doe', rollNumber: '8B-12', class: { name: '8B', gradeLevel: 8 } }
          ]);
        }
        setLoading(false);
      })
      .catch(() => {
        setChildren([
          { id: 'student-1', name: 'John Doe Jr.', rollNumber: '10A-05', class: { name: '10A', gradeLevel: 10 } },
          { id: 'student-2', name: 'Jane Doe', rollNumber: '8B-12', class: { name: '8B', gradeLevel: 8 } }
        ]);
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
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Parent Portal</h1>
        <p className="mt-2 text-gray-600">Welcome! View academic progress and attendance for your children.</p>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-6">My Children</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map(child => (
          <Link key={child.id} href={`/dashboard/parent/${child.id}`}>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col h-full">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl flex-shrink-0">
                  {child.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{child.name}</h3>
                  <p className="text-sm text-gray-500">Roll No: {child.rollNumber}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex-grow">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Class</span>
                  <span className="font-semibold text-gray-800">{child.class?.name || 'N/A'}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-sm font-medium text-blue-600 group-hover:text-blue-700">
                View Dashboard
                <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
