'use client';

import React, { useEffect, useState } from 'react';
import { WeeklyGrid, TimetableEntry } from '../../../../components/timetable/WeeklyGrid';

export default function StudentTimetable() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/timetable/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('wisdomly_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEntries(data.data);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Class Timetable</h1>
        <p className="mt-2 text-gray-600">View your section's weekly schedule.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <WeeklyGrid entries={entries} role="STUDENT" />
      </div>
    </div>
  );
}
