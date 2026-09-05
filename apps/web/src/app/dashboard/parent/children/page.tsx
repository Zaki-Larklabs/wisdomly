'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Users, Loader2, GraduationCap, ArrowRight } from 'lucide-react';

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/parents/me/children').then(r => {
      setChildren(r.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={24} className="animate-spin text-slate-400" />
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Children</h1>
        <p className="text-sm text-slate-500 mt-1">View progress and details for each child.</p>
      </div>

      {children.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No children linked</p>
          <p className="text-xs text-slate-400 mt-1">Your account is not yet linked to any student records.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {children.map((child: any) => (
            <Link key={child.id} href={`/dashboard/parent/children/${child.id}`}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-amber-300 transition flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg shrink-0">
                {child.name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 group-hover:text-amber-600 transition">{child.name}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span>Roll: {child.rollNumber}</span>
                  <span>{child.class?.name} — {child.section?.name}</span>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
