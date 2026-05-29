import React from 'react';

export interface TimetableEntry {
  id: string;
  dayOfWeek: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: { name: string; code: string };
  teacher: { name: string };
  class: { name: string };
}

interface WeeklyGridProps {
  entries: TimetableEntry[];
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const WeeklyGrid: React.FC<WeeklyGridProps> = ({ entries, role }) => {
  // Find max periods, default to at least 5
  const maxPeriod = entries.reduce((max, entry) => Math.max(max, entry.periodNumber), 5);
  
  const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1);

  const getEntry = (dayIndex: number, period: number) => {
    return entries.find(e => e.dayOfWeek === dayIndex + 1 && e.periodNumber === period);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
              Day / Period
            </th>
            {periods.map(p => (
              <th key={p} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px]">
                Period {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {DAYS.map((day, dayIdx) => (
            <tr key={day} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 sticky left-0 z-10 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                {day}
              </td>
              {periods.map(period => {
                const entry = getEntry(dayIdx, period);
                return (
                  <td key={period} className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 border-l border-gray-100">
                    {entry ? (
                      <div className="flex flex-col space-y-1 bg-blue-50 p-3 rounded-md border border-blue-100 shadow-sm transition-transform hover:scale-105 cursor-pointer">
                        <span className="font-bold text-blue-800 tracking-tight">{entry.subject.name}</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[11px] font-medium text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                            {entry.startTime} - {entry.endTime}
                          </span>
                        </div>
                        {role !== 'TEACHER' && (
                          <span className="text-xs text-gray-600 mt-1 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            {entry.teacher.name}
                          </span>
                        )}
                        {role === 'TEACHER' && (
                          <span className="text-xs text-gray-600 mt-1 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                            {entry.class.name}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300">-</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
