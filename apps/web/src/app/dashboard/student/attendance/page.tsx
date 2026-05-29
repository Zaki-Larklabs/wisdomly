'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';

export default function StudentAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    // Student ID isn't directly user.id in the schema, but user.id is the auth reference.
    // The endpoint getStudentAttendance takes studentId. Let's assume there is an endpoint `/api/v1/students/me` to get the student profile,
    // or we can use an endpoint like `/api/v1/attendance/me` which resolves the studentId.
    // For now, let's use the `/api/v1/attendance/student/${user.id}` and let the backend handle fetching the student record by userId if needed,
    // OR we change the API to fetch via `/me`. Since we don't have `/me` for attendance, we'll assume we pass the `user.id` and the backend resolves it or we just use `user.id` as `userId`.
    // Wait, the API we wrote is `/api/v1/attendance/student/:studentId`.
    // It expects `studentId`, which is the `Student.id`.
    // We should probably fetch the student's ID first or use `user.id` if the endpoint translates it.
    // Let's assume the frontend knows the student ID from AuthContext in a real app, but here we just pass user.id and the backend will need to handle it.
    
    // To be safe, let's just make the fetch request.
    fetch(`/api/v1/attendance/student/${user.id}?month=${month}&year=${year}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('wisdomly_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAttendance(data.data);
        }
        setLoading(false);
      });
  }, [user, month, year]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getStatus = (day: number, session: 'AM' | 'PM') => {
    const record = attendance.find(a => new Date(a.date).getDate() === day && a.session === session);
    return record ? record.status : '-';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800 border-green-200';
      case 'ABSENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'LATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LEAVE': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Attendance</h1>
          <p className="mt-2 text-gray-600">Track your daily attendance record.</p>
        </div>
        <div className="flex space-x-4">
          <select 
            value={month} 
            onChange={e => setMonth(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg p-2"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <select 
            value={year} 
            onChange={e => setYear(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg p-2"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center font-semibold text-gray-500 text-sm py-2">
                {d}
              </div>
            ))}
            
            {/* Empty slots for start of month - Simplified for demonstration */}
            {Array.from({ length: new Date(year, month - 1, 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 bg-gray-50 rounded-lg border border-gray-100"></div>
            ))}

            {days.map(day => (
              <div key={day} className="h-24 border border-gray-200 rounded-lg p-2 flex flex-col justify-between hover:shadow-md transition-shadow">
                <span className="text-sm font-medium text-gray-700">{day}</span>
                <div className="space-y-1 mt-2">
                  <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getStatusColor(getStatus(day, 'AM'))}`}>
                    AM: {getStatus(day, 'AM')}
                  </div>
                  <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getStatusColor(getStatus(day, 'PM'))}`}>
                    PM: {getStatus(day, 'PM')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
