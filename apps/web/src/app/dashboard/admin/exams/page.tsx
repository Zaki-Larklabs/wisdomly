'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminExamsManager() {
  const [classes, setClasses] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]); // Normally fetched from API
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch('/api/v1/classes', {
      headers: { Authorization: `Bearer ${localStorage.getItem('wisdomly_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setClasses(data.data);
        }
      });
      
    // Mock exams
    setExams([
      { id: 'exam-unit-1', name: 'Unit Test 1', maxMarks: 50, date: '2026-04-15' },
      { id: 'exam-mid-term', name: 'Mid Term Exam', maxMarks: 100, date: '2026-06-10' },
      { id: 'exam-final', name: 'Final Exam', maxMarks: 100, date: '2026-11-20' }
    ]);
  }, []);

  const handleGenerateReportCards = async () => {
    if (!selectedClass || !selectedExam) return;
    
    setGenerating(true);
    const payload = {
      classId: selectedClass,
      examId: selectedExam
    };

    try {
      const res = await fetch('/api/v1/marks/report-cards/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('wisdomly_token')}` 
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        alert(`Successfully generated ${data.data.generatedCount} report cards!`);
      } else {
        alert(`Error: ${data.error.message}`);
      }
    } catch (err) {
      alert('Failed to generate report cards');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Exams & Report Cards</h1>
          <p className="mt-2 text-gray-600">Manage exams and generate student report cards.</p>
        </div>
        <button className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Create Exam
        </button>
      </div>

      {/* Generate Report Cards Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Generate Report Cards</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-64 border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select a class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
            <select 
              value={selectedExam} 
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-64 border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select an exam</option>
              {exams.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleGenerateReportCards}
            disabled={!selectedClass || !selectedExam || generating}
            className="px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 shadow-sm transition-colors disabled:opacity-50 h-[46px] flex items-center justify-center min-w-[140px]"
          >
            {generating ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              'Generate Cards'
            )}
          </button>
        </div>
      </div>

      {/* Exam List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Upcoming & Past Exams</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Marks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {exams.map(exam => (
              <tr key={exam.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.maxMarks}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full border border-green-200">
                    Completed
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                  <Link href={`#`} className="text-blue-600 hover:text-blue-900">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
