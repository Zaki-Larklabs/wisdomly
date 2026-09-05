'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { DollarSign, AlertTriangle } from 'lucide-react';
import NotificationBell from '../../../components/notifications/NotificationBell';
import { useFees } from '../../../hooks/useFees';

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
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Parent Portal</h1>
          <p className="mt-2 text-gray-600">Welcome! View academic progress and attendance for your children.</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <Link
            href="/dashboard/parent/fees"
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            <DollarSign size={16} className="mr-1.5" />
            View Fees
          </Link>
        </div>
      </div>

      {/* Fee Summary Widget */}
      <ParentFeeWidget children={children} />

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
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex-grow space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Class</span>
                  <span className="font-semibold text-gray-800">{child.class?.name || 'N/A'}</span>
                </div>
                <ChildFeeSummary studentId={child.id} />
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

function ChildFeeSummary({ studentId }: { studentId: string }) {
  const { data: fees, isLoading } = useFees(studentId);

  if (isLoading) return (
    <div className="flex justify-between items-center text-sm mt-2">
      <span className="text-gray-400 text-xs">Loading fees...</span>
    </div>
  );

  if (!fees || fees.length === 0) return null;

  const unpaid = fees.filter(f => f.status !== 'PAID' && f.status !== 'WAIVED');
  const overdue = unpaid.filter(f => f.daysOverdue > 0);
  const totalDue = unpaid.reduce((sum, f) => sum + (f.effectiveAmount - f.paidAmount), 0);

  if (unpaid.length === 0) return (
    <div className="flex justify-between items-center text-sm mt-2">
      <span className="text-emerald-600 text-xs font-medium flex items-center gap-1">
        <span>✓</span> Fees up to date
      </span>
    </div>
  );

  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-500">Due Amount</span>
        <span className="font-bold text-amber-600">₹{totalDue.toLocaleString('en-IN')}</span>
      </div>
      {overdue.length > 0 && (
        <div className="flex justify-between items-center text-xs">
          <span className="text-rose-500 flex items-center gap-1">
            <AlertTriangle size={10} /> Overdue
          </span>
          <span className="font-bold text-rose-600">{overdue.length} item{overdue.length > 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}

function ParentFeeWidget({ children }: { children: any[] }) {
  const [childFeeData, setChildFeeData] = useState<Record<string, { totalDue: number; overdue: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (children.length === 0) return;

    const fetchAllFees = async () => {
      const token = localStorage.getItem('wisdomly_token');
      const results: Record<string, { totalDue: number; overdue: number }> = {};
      
      for (const child of children) {
        try {
          const res = await fetch(`/api/v1/fees?studentId=${child.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) continue;
          const data = await res.json();
          const fees = data.data || [];
          const unpaid = fees.filter((f: any) => f.status !== 'PAID' && f.status !== 'WAIVED');
          const totalDue = unpaid.reduce((sum: number, f: any) => sum + ((f.effectiveAmount || f.amount) - (f.paidAmount || 0)), 0);
          const overdue = unpaid.filter((f: any) => f.daysOverdue > 0).length;
          results[child.id] = { totalDue, overdue };
        } catch {
          // Skip if API not available (e.g. mock data)
        }
      }
      
      setChildFeeData(results);
      setLoading(false);
    };

    fetchAllFees();
  }, [children]);

  const totalOutstanding = Object.values(childFeeData).reduce((sum, d) => sum + d.totalDue, 0);
  const totalOverdue = Object.values(childFeeData).reduce((sum, d) => sum + d.overdue, 0);

  if (loading || Object.keys(childFeeData).length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <DollarSign size={20} className="text-blue-600" />
          Fee Overview
        </h2>
        <Link href="/dashboard/parent/fees" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          View All Fees →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-blue-100 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Outstanding</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">₹{totalOutstanding.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg border border-blue-100 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Children with Dues</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{Object.values(childFeeData).filter(d => d.totalDue > 0).length}/{children.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-amber-100 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Overdue Items</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{totalOverdue}</p>
        </div>
      </div>
    </div>
  );
}
