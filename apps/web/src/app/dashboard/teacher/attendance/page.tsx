'use client';

import React, { useEffect, useState } from 'react';

export default function TeacherAttendance() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('AM');
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch assigned classes (using generic /classes for now)
    fetch('/api/v1/classes', {
      headers: { Authorization: `Bearer ${localStorage.getItem('wisdomly_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setClasses(data.data);
      });
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    
    setLoading(true);
    // Fetch students for the class and previous attendance
    Promise.all([
      fetch(`/api/v1/students?classId=${selectedClass}`, { headers: { Authorization: `Bearer ${localStorage.getItem('wisdomly_token')}` } }).then(r => r.json()),
      fetch(`/api/v1/attendance/class/${selectedClass}?date=${date}&session=${session}`, { headers: { Authorization: `Bearer ${localStorage.getItem('wisdomly_token')}` } }).then(r => r.json())
    ]).then(([studentsData, attendanceData]) => {
      if (studentsData.success) {
        setStudents(studentsData.data.data || []); // depends on pagination
      }
      
      const newAttendance: Record<string, string> = {};
      if (attendanceData.success && attendanceData.data.length > 0) {
        attendanceData.data.forEach((record: any) => {
          newAttendance[record.studentId] = record.status;
        });
      } else {
        // Default all to PRESENT if no record exists
        if (studentsData.success) {
          (studentsData.data.data || []).forEach((s: any) => {
            newAttendance[s.id] = 'PRESENT';
          });
        }
      }
      setAttendance(newAttendance);
      setLoading(false);
    });
  }, [selectedClass, date, session]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    const payload = {
      classId: selectedClass,
      date,
      session,
      attendance: Object.keys(attendance).map(studentId => ({
        studentId,
        status: attendance[studentId]
      }))
    };

    const res = await fetch('/api/v1/attendance/bulk', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('wisdomly_token')}` 
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      alert('Attendance saved successfully');
    } else {
      alert('Failed to save attendance');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mark Attendance</h1>
          <p className="mt-2 text-gray-600">Select class, date, and session to mark attendance.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={!selectedClass || students.length === 0}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
        >
          Save Attendance
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-48 border border-gray-300 rounded-lg p-2"
          >
            <option value="">Select a class</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="w-48 border border-gray-300 rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
          <select 
            value={session} 
            onChange={(e) => setSession(e.target.value)}
            className="w-48 border border-gray-300 rounded-lg p-2"
          >
            <option value="AM">AM Session</option>
            <option value="PM">PM Session</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : selectedClass && students.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map(student => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.rollNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      {['PRESENT', 'ABSENT', 'LATE', 'LEAVE'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(student.id, status)}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            attendance[student.id] === status 
                              ? status === 'PRESENT' ? 'bg-green-100 text-green-800 border-green-200' 
                                : status === 'ABSENT' ? 'bg-red-100 text-red-800 border-red-200'
                                : status === 'LATE' ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                : 'bg-gray-200 text-gray-800 border-gray-300'
                              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 border'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selectedClass ? (
        <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          No students found in this class.
        </div>
      ) : null}
    </div>
  );
}
