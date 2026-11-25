import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads, useCreateLead } from '../hooks/useLeads';

const FILTERS = ['all', 'hot', 'warm', 'cold'];

const SAMPLE_STUDENTS = [
  { name: 'Aditya Sen', phone: '+919876500001', course: 'Executive Masterclass in Generative AI & LLMs', lang: 'en-IN' },
  { name: 'Pooja Sharma', phone: '+919876500002', course: 'Full-Stack Machine Learning & MLOps Engineering', lang: 'hi-IN' },
  { name: 'Sanjay Murugan', phone: '+919876500003', course: 'Executive Masterclass in Generative AI & LLMs', lang: 'ta-IN' },
  { name: 'Kavita Deshmukh', phone: '+919876500004', course: 'Zero-to-Hero: Python, Mathematics & AI Foundations', lang: 'hi-IN' },
];

export default function Leads() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const nav = useNavigate();

  const params = {};
  if (filter !== 'all') params.status = filter;
  if (search) params.search = search;

  const { data, isLoading, error } = useLeads(params);
  const createMutation = useCreateLead();

  const handleAddTest = () => {
    const s = SAMPLE_STUDENTS[Math.floor(Math.random() * SAMPLE_STUDENTS.length)];
    const uniquePhone = `+9198765${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
    createMutation.mutate({
      name: s.name,
      phone: uniquePhone,
      course_of_interest: s.course,
      language: s.lang,
      source: 'website_inquiry',
    });
  };

  const badgeClass = (status) => {
    if (status === 'hot') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'warm') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (status === 'cold') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  return (
    <div className="space-y-5 px-1 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#141416]">Course Leads & Inquiries</h1>
          <p className="text-xs text-gray-500 mt-1">Prospective students interested in AI, ML & Generative AI programs</p>
        </div>
        <button
          className="bg-[#141416] text-white px-5 py-2.5 rounded-full flex items-center gap-2 font-medium text-sm hover:bg-gray-800 transition"
          onClick={handleAddTest}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Registering…' : '+ Add Student Inquiry'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-[#141416] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => setFilter(f)}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by student name, phone, or course…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white border border-gray-200 rounded-full px-5 py-2 text-sm focus:outline-none focus:border-[#141416] transition-colors placeholder:text-gray-400"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-[#141416] border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-[2rem] p-10 text-center shadow-soft text-red-500">Failed to load leads</div>
      ) : !data?.leads?.length ? (
        <div className="bg-white rounded-[2rem] p-16 text-center shadow-soft">
          <p className="text-gray-500 text-lg">No course inquiries found</p>
          <p className="text-gray-400 text-sm mt-2">Add a student inquiry or seed demo data from the Dashboard</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Course of Interest</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Sentiment</th>
                  <th className="py-3 px-4">Lead Status</th>
                  <th className="py-3 px-4">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4 font-semibold text-[#141416]">
                      {lead.name}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-xs">{lead.phone}</td>
                    <td className="py-3.5 px-4 text-xs font-medium text-gray-800 max-w-xs">
                      {lead.course_of_interest || 'Executive Masterclass in Generative AI'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {lead.language?.includes('hi') ? 'Hindi' : lead.language?.includes('ta') ? 'Tamil' : 'English'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-semibold text-gray-700">{lead.sentiment || 'Interested'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${badgeClass(lead.status)}`}>
                        {lead.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#141416]">
                      {lead.score || 70}/100
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
