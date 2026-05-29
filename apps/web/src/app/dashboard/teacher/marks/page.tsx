'use client';

import React, { useEffect, useState } from 'react';

export default function TeacherMarksEntry() {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<Record<string, { obtained: number, remarks: string }>>({});
  const [loading, setLoading] = useState(false);

  // Initial load of classes and exams
  useEffect(() => {
    Promise.all([
      fetch('/api/v1/classes', { headers: { Authorization: `Bearer ${localStorage.getItem('wisdomly_token')}` } }).then(r => r.json()),
      // Note: Realistically, we need an endpoint for Exams. For now, assuming an exams endpoint exists or using mock.
      // If no exams endpoint exists yet, we should create one. We'll add a fetch here.
    ]).then(([classesData]) => {
      if (classesData.success) setClasses(classesData.data);
      
      // Mock exams since we didn't build a full CRUD for Exams
      setExams([
        { id: 'exam-unit-1', name: 'Unit Test 1', maxMarks: 50 },
        { id: 'exam-mid-term', name: 'Mid Term Exam', maxMarks: 100 },
        { id: 'exam-final', name: 'Final Exam', maxMarks: 100 }
      ]);
    });
  }, []);

  // When class changes, load subjects for that class
  useEffect(() => {
    if (!selectedClass) return;
    fetch(`/api/v1/subjects/class/${selectedClass}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('wisdomly_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setSubjects(data.data);
      });
  }, [selectedClass]);

  // When class, subject, and exam are selected, load students
  useEffect(() => {
    if (!selectedClass || !selectedSubject || !selectedExam) return;
    
    setLoading(true);
    // Fetch students
    fetch(`/api/v1/students?classId=${selectedClass}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('wisdomly_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStudents(data.data.data || []);
          
          // Initialize marks state
          const initialMarks: Record<string, { obtained: number, remarks: string }> = {};
          (data.data.data || []).forEach((s: any) => {
            initialMarks[s.id] = { obtained: 0, remarks: '' };
          });
          setMarks(initialMarks);
        }
        setLoading(false);
      });
  }, [selectedClass, selectedSubject, selectedExam]);

  const handleMarkChange = (studentId: string, field: 'obtained' | 'remarks', value: any) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    const payload = {
      examId: selectedExam,
      subjectId: selectedSubject,
      maxMarks: Number(maxMarks),
      marks: Object.keys(marks).map(studentId => ({
        studentId,
        marksObtained: Number(marks[studentId].obtained),
        remarks: marks[studentId].remarks
      }))
    };

    const res = await fetch('/api/v1/marks/bulk', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('wisdomly_token')}` 
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      alert('Marks saved successfully!');
    } else {
      alert('Failed to save marks');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Enter Marks</h1>
          <p className="mt-2 text-gray-600">Record assessment results for your students.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={!selectedClass || !selectedSubject || !selectedExam || students.length === 0}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
        >
          Save Marks
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!selectedClass}
            className="w-48 border border-gray-300 rounded-lg p-2 disabled:bg-gray-100"
          >
            <option value="">Select a subject</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
          <select 
            value={selectedExam} 
            onChange={(e) => {
              setSelectedExam(e.target.value);
              const exam = exams.find(ex => ex.id === e.target.value);
              if (exam) setMaxMarks(exam.maxMarks);
            }}
            className="w-48 border border-gray-300 rounded-lg p-2"
          >
            <option value="">Select an exam</option>
            {exams.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
          <input 
            type="number"
            value={maxMarks}
            onChange={(e) => setMaxMarks(Number(e.target.value))}
            className="w-32 border border-gray-300 rounded-lg p-2"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : selectedClass && selectedSubject && selectedExam && students.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Marks Obtained</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks (Optional)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map(student => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.rollNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <input 
                      type="number" 
                      min="0"
                      max={maxMarks}
                      value={marks[student.id]?.obtained || 0}
                      onChange={(e) => handleMarkChange(student.id, 'obtained', e.target.value)}
                      className="w-24 border border-gray-300 rounded-md p-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <input 
                      type="text" 
                      placeholder="Excellent work..."
                      value={marks[student.id]?.remarks || ''}
                      onChange={(e) => handleMarkChange(student.id, 'remarks', e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (selectedClass || selectedSubject || selectedExam) ? (
        <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          Complete your selection to view students.
        </div>
      ) : null}
    </div>
  );
}
