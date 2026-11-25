import React from 'react';
import { useAppointments, useUpdateAppointmentStatus } from '../hooks/useLeads';

export default function RMQueue() {
  const { data: appointments, isLoading, error } = useAppointments();
  const updateMutation = useUpdateAppointmentStatus();

  const handleStatusChange = (id, status) => {
    updateMutation.mutate({ id, status });
  };

  return (
    <div className="space-y-5 px-1 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#141416] text-[#EBF981] text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase">
              CRM Integration
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-[#141416] mt-1">1-on-1 AI Mentor Demos & Appointments</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Automated bookings triggered during student voice counseling sessions
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-[#141416] border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-[2rem] p-10 text-center text-red-500">
          Failed to load appointments list
        </div>
      ) : !appointments || appointments.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm">
          <p className="text-gray-500 text-lg">No appointments booked yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Use the Voice Counselor mic on the Dashboard to say "Book a demo session", and it will appear here automatically!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Scheduled Slot</th>
                  <th className="py-3 px-4">AI Mentor Counselor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#141416]">{item.lead_name}</div>
                      <div className="text-xs text-gray-400">{item.appointment_type || '1-on-1 Demo'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 font-mono text-xs">{item.phone}</td>
                    <td className="py-3.5 px-4 font-medium text-[#141416] text-xs max-w-xs">
                      {item.course_title || 'Executive Masterclass in Generative AI'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-[#141416]">{item.slot_date}</div>
                      <div className="text-[11px] text-gray-500">{item.slot_time}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-700">
                      {item.counselor || 'Dr. Rohit Verma (Google AI)'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                          item.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'completed'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {item.status ? item.status.toUpperCase() : 'CONFIRMED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-2">
                        {item.status !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'completed')}
                            className="text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
                          >
                            Mark Completed
                          </button>
                        )}
                        {item.status === 'completed' && (
                          <span className="text-xs text-gray-400 italic">Session Done</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
