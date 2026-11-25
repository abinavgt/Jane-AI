import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { useDashboardStats, useSeedDemo } from '../hooks/useLeads';
import { Link } from 'react-router-dom';
import VoiceCounselorWidget from '../components/VoiceCounselorWidget';

export default function Dashboard() {
  const { data, isLoading, error, refetch } = useDashboardStats();
  const seedMutation = useSeedDemo();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin w-10 h-10 border-3 border-[#141416] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-[2rem] p-8 text-center shadow-soft">
        <p className="text-red-500 mb-2 font-medium">Failed to load dashboard data</p>
        <p className="text-gray-400 text-sm">{error.message}</p>
      </div>
    );
  }

  const { stats, funnel, distribution, languages, sentiments, recent_calls, courses, appointments } = data || {};

  // Funnel data
  const funnelData = funnel ? [
    { stage: 'Inquiries', value: funnel.inquiries || 0 },
    { stage: 'Contacted', value: funnel.contacted || 0 },
    { stage: 'Engaged', value: funnel.engaged || 0 },
    { stage: 'Qualified', value: funnel.qualified || 0 },
    { stage: 'Demos Booked', value: funnel.demos_booked || 0 },
  ] : [];

  // Language data
  const languageData = languages ? [
    { name: 'English', value: languages.English || 0, color: '#141416' },
    { name: 'Hindi', value: languages.Hindi || 0, color: '#EBF981' },
    { name: 'Tamil', value: languages.Tamil || 0, color: '#6366F1' },
  ] : [];

  // Sentiment data
  const sentimentData = sentiments ? [
    { name: 'Enthusiastic', value: sentiments.Enthusiastic || 0, color: '#10B981' },
    { name: 'Interested', value: sentiments.Interested || 0, color: '#3B82F6' },
    { name: 'Hesitant', value: sentiments.Hesitant || 0, color: '#F59E0B' },
  ] : [];

  const totalLeads = stats?.total_leads || 0;
  const hotLeads = stats?.hot || 0;
  const demosBooked = stats?.total_appointments || 0;
  const conversionPct = stats?.conversion_pct || 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <header className="flex flex-wrap justify-between items-center gap-4 pt-1 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#141416] text-[#EBF981] text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              Jane AI Academy
            </span>
            <span className="text-xs text-gray-500">Live AI & ML Course Admissions Engine</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-[#141416] tracking-tight mt-1">
            Course Counseling & Admissions Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="bg-[#141416] text-white px-5 py-2.5 rounded-full flex items-center gap-2 font-medium text-sm hover:bg-gray-800 transition shadow-sm"
            disabled={seedMutation.isPending}
            onClick={() => seedMutation.mutate()}
          >
            <svg fill="none" height="16" width="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14" /><path d="M12 5v14" />
            </svg>
            {seedMutation.isPending ? 'Seeding Demo Data…' : 'Seed Course Leads'}
          </button>
        </div>
      </header>

      {seedMutation.isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-emerald-800 text-sm flex items-center gap-2">
          <span>✅</span>
          <span>AI Course student leads and counseling simulations seeded! Live insights updated.</span>
        </div>
      )}

      {/* Prominent Voice Agent Microphone Section */}
      <div className="px-1">
        <VoiceCounselorWidget onAppointmentBooked={() => refetch()} />
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
        {/* Total Inquiries */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-sm font-medium">
            <span>Total Inquiries</span>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#141416]">
              👥
            </div>
          </div>
          <div className="mt-4">
            <div className="text-4xl font-semibold text-[#141416]">{totalLeads}</div>
            <p className="text-xs text-gray-400 mt-1">Across Hindi, Tamil & English</p>
          </div>
        </div>

        {/* Hot / Qualified Leads */}
        <div className="bg-[#EBF981] rounded-[2rem] p-6 shadow-sm border border-[#d6e469] flex flex-col justify-between text-[#141416]">
          <div className="flex items-center justify-between text-[#141416]/80 text-sm font-medium">
            <span>High-Intent Leads</span>
            <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center font-bold">
              🔥
            </div>
          </div>
          <div className="mt-4">
            <div className="text-4xl font-semibold">{hotLeads}</div>
            <p className="text-xs text-[#141416]/70 mt-1">{conversionPct}% Qualification Rate</p>
          </div>
        </div>

        {/* 1-on-1 Demos Booked */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-sm font-medium">
            <span>1-on-1 Demos Booked</span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              📅
            </div>
          </div>
          <div className="mt-4">
            <div className="text-4xl font-semibold text-[#141416]">{demosBooked}</div>
            <p className="text-xs text-emerald-600 mt-1">Automated CRM Bookings</p>
          </div>
        </div>

        {/* Active Flagship Courses */}
        <div className="bg-[#141416] rounded-[2rem] p-6 shadow-sm border border-gray-800 flex flex-col justify-between text-white">
          <div className="flex items-center justify-between text-gray-400 text-sm font-medium">
            <span>Flagship AI Courses</span>
            <div className="w-8 h-8 rounded-full bg-white/10 text-[#EBF981] flex items-center justify-center font-bold">
              🎓
            </div>
          </div>
          <div className="mt-4">
            <div className="text-4xl font-semibold text-[#EBF981]">{courses?.length || 3}</div>
            <p className="text-xs text-gray-300 mt-1">100% Placement Guarantee</p>
          </div>
        </div>
      </div>

      {/* Middle Row: Funnel & Multilingual Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-1">
        {/* Sales Funnel Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col min-h-[320px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-[#141416]">Course Enrollment & Qualification Funnel</h3>
              <p className="text-xs text-gray-400">From initial voice inquiry to 1-on-1 demo booking</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
              Live Pipeline
            </span>
          </div>

          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={funnelData} margin={{ left: -15, right: 10 }}>
              <XAxis dataKey="stage" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141416', color: '#fff', borderRadius: '12px', border: 'none' }}
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              />
              <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={34}>
                {funnelData.map((_, index) => (
                  <Cell key={index} fill={index === funnelData.length - 1 ? '#EBF981' : '#141416'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Multilingual & Sentiment Insights */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#141416]">Multilingual Student Reach</h3>
            <p className="text-xs text-gray-400 mb-4">Interaction distribution by language</p>

            <div className="space-y-3">
              {languageData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#141416] font-medium">{item.name}</span>
                  </div>
                  <span className="text-gray-500 font-semibold">{item.value} calls</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Student Sentiment Analysis</h4>
            <div className="flex gap-2">
              <span className="flex-1 bg-emerald-50 text-emerald-700 text-xs py-1.5 px-2 rounded-xl text-center font-medium border border-emerald-100">
                🌟 {sentiments?.Enthusiastic || 0} Enthusiastic
              </span>
              <span className="flex-1 bg-blue-50 text-blue-700 text-xs py-1.5 px-2 rounded-xl text-center font-medium border border-blue-100">
                💡 {sentiments?.Interested || 0} Interested
              </span>
              <span className="flex-1 bg-amber-50 text-amber-700 text-xs py-1.5 px-2 rounded-xl text-center font-medium border border-amber-100">
                ⚠️ {sentiments?.Hesitant || 0} Hesitant
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI & ML Course Catalog Cards */}
      <div className="px-1">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-[#141416]">Available AI & Machine Learning Programs</h3>
            <p className="text-xs text-gray-500">Live weekend batches with 100% placement support & GPU cloud labs</p>
          </div>
          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
            ● Admissions Open (20% Early Bird)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(courses || []).map((c) => (
            <div key={c.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700">
                    {c.duration} • {c.level}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ★ {c.rating || 4.9}
                  </span>
                </div>

                <h4 className="text-base font-bold text-[#141416] leading-snug">{c.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{c.format}</p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {(c.skills || []).slice(0, 4).map((skill, idx) => (
                    <span key={idx} className="text-[11px] px-2 py-0.5 bg-gray-50 text-gray-600 rounded-md border border-gray-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-[#141416]">₹{c.discounted_fee?.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 line-through">₹{c.original_fee?.toLocaleString()}</span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">EMI: ₹{c.emi_monthly}/mo (0% interest)</span>
                </div>
                <button
                  onClick={() => alert(`Selected course: ${c.title}. Use the Voice Counselor mic above to ask questions or book a demo!`)}
                  className="px-3.5 py-1.5 bg-[#141416] hover:bg-gray-800 text-white rounded-full text-xs font-medium transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Counseling Calls & Business Summaries */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[#141416]">Recent Student Voice Interactions & Insights</h3>
            <p className="text-xs text-gray-400">Real-time transcripts, sentiment scoring, and recommended next actions</p>
          </div>
          <Link to="/dashboard/calls" className="text-xs text-[#141416] font-semibold hover:underline">
            View All Calls →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Language</th>
                <th className="py-2.5 px-3">Sentiment</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">AI Call Summary & Next Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(recent_calls || []).slice(0, 5).map((call) => (
                <tr key={call.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#141416]">{call.lead_name || 'Student'}</div>
                    <div className="text-[11px] text-gray-400">{call.phone}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full font-medium text-[11px]">
                      {call.language_used || 'English'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                      call.sentiment === 'Enthusiastic' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      call.sentiment === 'Interested' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {call.sentiment || 'Interested'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-[#141416]">
                    {call.lead_score || 70}/100
                  </td>
                  <td className="py-3 px-3 max-w-md">
                    <p className="text-gray-700 text-xs line-clamp-2">{call.summary || 'Inquired about course curriculum.'}</p>
                    {call.recommended_action && (
                      <span className="inline-block mt-1 text-[11px] text-[#141416] font-medium bg-[#EBF981]/50 px-2 py-0.5 rounded">
                        Next: {call.recommended_action}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
