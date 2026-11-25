import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCalls, getLeads, getCallDetail } from '../lib/api';
import TranscriptView from '../components/TranscriptView';

export default function CallDetail() {
  const [params, setParams] = useSearchParams();
  const urlCallId = params.get('call_id');
  const [selectedCallId, setSelectedCallId] = useState(urlCallId || null);
  const [customPhone, setCustomPhone] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('interested'); // 'interested' or 'all'

  // Fetch all candidate leads who showed interest
  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['leads-all'],
    queryFn: () => getLeads({ limit: 50 }),
  });

  // Fetch calls list
  const { data: callsData, isLoading: callsLoading } = useQuery({
    queryKey: ['calls-list-all'],
    queryFn: () => getCalls({ limit: 50 }),
  });

  const allLeads = leadsData?.leads || [];
  // Filter candidates who showed interest (hot, warm, or score >= 60)
  const interestedCandidates = allLeads.filter(
    (l) => l.status === 'hot' || l.status === 'warm' || (l.score && l.score >= 60) || l.sentiment === 'Enthusiastic' || l.sentiment === 'Interested'
  );

  const displayCandidates = activeTab === 'interested' && interestedCandidates.length > 0 ? interestedCandidates : allLeads;

  // Filter by search query (phone number or name)
  const filteredCandidates = displayCandidates.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.course_of_interest && c.course_of_interest.toLowerCase().includes(q))
    );
  });

  // Effective call ID to view
  const allCalls = callsData || [];
  const effectiveCallId = selectedCallId || (allCalls.length > 0 ? allCalls[0].id : null);

  const { data: callDetailData, isLoading: callLoading } = useQuery({
    queryKey: ['call-detail', effectiveCallId],
    queryFn: () => getCallDetail(effectiveCallId),
    enabled: !!effectiveCallId,
  });

  const handleCopyNumber = (phone) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2500);
  };

  const handleSelectCandidate = (candidate) => {
    // Check if this candidate has an existing call
    const candidateCall = allCalls.find((c) => c.lead_id === candidate.id);
    if (candidateCall) {
      setSelectedCallId(candidateCall.id);
      setParams({ call_id: candidateCall.id });
    } else {
      setCustomPhone(candidate.phone);
    }
  };

  const { call, events, score, lead } = callDetailData || {};

  return (
    <div className="space-y-6 px-1 pt-2">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#141416] text-[#EBF981] text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              Caller & Dialer Hub
            </span>
            <span className="text-xs text-gray-500">Jane AI Course Counseling Communications</span>
          </div>
          <h1 className="text-3xl font-semibold text-[#141416] tracking-tight mt-1">
            Candidate Caller Directory & Call Insights
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Access verified phone numbers from interested candidates and review AI voice counseling call recordings.
          </p>
        </div>

        {/* Custom Phone Number Quick-Caller / Search */}
        <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-200">
          <div className="flex items-center pl-3 text-gray-400">
            <svg fill="none" height="16" width="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Custom candidate phone #…"
            value={customPhone}
            onChange={(e) => setCustomPhone(e.target.value)}
            className="text-xs font-mono px-2 py-1.5 focus:outline-none w-48 text-gray-800"
          />
          <button
            onClick={() => {
              if (customPhone.trim()) {
                handleCopyNumber(customPhone.trim());
              }
            }}
            disabled={!customPhone.trim()}
            className="bg-[#141416] text-[#EBF981] hover:bg-gray-800 disabled:opacity-40 text-xs px-3 py-1.5 rounded-xl font-medium transition"
          >
            {copiedPhone === customPhone.trim() ? '✓ Copied' : 'Copy Number'}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column Candidates & Custom Numbers, Right Column Call Detail */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Candidates Who Showed Interest (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-white rounded-[2rem] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#141416]">
                  Interested Candidates ({filteredCandidates.length})
                </h2>
              </div>
              <div className="flex bg-gray-100 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  onClick={() => setActiveTab('interested')}
                  className={`px-2.5 py-1 rounded-md transition ${activeTab === 'interested' ? 'bg-[#141416] text-white' : 'text-gray-500'}`}
                >
                  Hot & Warm
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-2.5 py-1 rounded-md transition ${activeTab === 'all' ? 'bg-[#141416] text-white' : 'text-gray-500'}`}
                >
                  All Inquiries
                </button>
              </div>
            </div>

            {/* Filter Search */}
            <div className="mt-3 relative">
              <input
                type="text"
                placeholder="Search candidate name or phone number…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 text-xs rounded-xl pl-8 pr-3 py-2 border border-gray-200 focus:outline-none focus:border-[#141416] transition"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </div>

            {/* Candidate List with Phone Numbers */}
            <div className="mt-4 space-y-2.5 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
              {leadsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-[#141416] border-t-transparent rounded-full" />
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No candidate numbers found matching your search.
                </div>
              ) : (
                filteredCandidates.map((c) => {
                  const isHot = c.status === 'hot';
                  const isWarm = c.status === 'warm';
                  const isSelected = lead?.id === c.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCandidate(c)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                        isSelected
                          ? 'bg-[#141416] text-white border-[#141416] shadow-md'
                          : 'bg-gray-50/70 hover:bg-gray-100/90 text-gray-800 border-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              isSelected
                                ? 'bg-[#EBF981] text-[#141416]'
                                : 'bg-[#141416] text-white'
                            }`}
                          >
                            {c.name ? c.name.charAt(0) : 'S'}
                          </div>
                          <div>
                            <p className="font-semibold text-xs leading-snug">{c.name}</p>
                            <span className={`text-[10px] ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                              {c.course_of_interest?.split(':')[0] || 'Generative AI & LLMs'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              isHot
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : isWarm
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {c.status || 'INTERESTED'}
                          </span>
                          <span className={`text-xs font-bold ${isSelected ? 'text-[#EBF981]' : 'text-[#141416]'}`}>
                            {c.score || 75}
                          </span>
                        </div>
                      </div>

                      {/* Custom Contact Phone Number row */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-gray-200/30 text-xs">
                        <div className="flex items-center gap-1 font-mono font-medium">
                          <span className="text-[11px] opacity-75">📞</span>
                          <span className={`${isSelected ? 'text-[#EBF981]' : 'text-gray-800'} font-semibold tracking-wide`}>
                            {c.phone}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyNumber(c.phone);
                            }}
                            className={`text-[11px] px-2.5 py-0.5 rounded-md font-medium transition ${
                              isSelected
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-white hover:bg-gray-200 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {copiedPhone === c.phone ? '✓ Copied' : 'Copy'}
                          </button>
                          <a
                            href={`tel:${c.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#EBF981] hover:bg-[#dce975] text-[#141416] text-[11px] px-2.5 py-0.5 rounded-md font-bold transition flex items-center gap-1"
                          >
                            <span>Call</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Call Detail & Transcript View (7 cols) */}
        <div className="xl:col-span-7 space-y-4">
          {callLoading ? (
            <div className="bg-white rounded-[2rem] p-16 flex justify-center items-center">
              <div className="animate-spin w-8 h-8 border-2 border-[#141416] border-t-transparent rounded-full" />
            </div>
          ) : call ? (
            <div className="space-y-4">
              {/* Selected Candidate Phone & Profile Banner */}
              {lead && (
                <div className="bg-white rounded-[2rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#141416] flex items-center justify-center text-xl font-bold text-[#EBF981]">
                      {lead.name?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#141416]">{lead.name}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs font-semibold text-gray-800 bg-gray-100 px-2.5 py-0.5 rounded-md border border-gray-200">
                          {lead.phone}
                        </span>
                        <span className="text-xs text-gray-500">· {lead.language || 'English'}</span>
                        <button
                          onClick={() => handleCopyNumber(lead.phone)}
                          className="text-xs text-emerald-600 hover:underline font-medium"
                        >
                          {copiedPhone === lead.phone ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                  {score && (
                    <span
                      className={`text-xs px-4 py-2 rounded-full font-bold uppercase tracking-wider ${
                        score.classification === 'hot'
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : score.classification === 'warm'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}
                    >
                      {score.classification} · {score.total_score}/100
                    </span>
                  )}
                </div>
              )}

              {/* Call Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Duration', value: `${call.duration_seconds || 0}s` },
                  { label: 'Status', value: call.status || 'Completed' },
                  { label: 'Language', value: call.language_used || lead?.language || 'English' },
                  { label: 'Call #', value: call.call_number || 1 },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{label}</p>
                    <p className="text-lg font-bold text-[#141416] mt-1">{value}</p>
                  </div>
                ))}
              </div>

              {/* Transcript & Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-[2rem] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Conversation Transcript</h3>
                  <div className="max-h-80 overflow-y-auto pr-1">
                    <TranscriptView events={events || []} />
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Counseling Summary & Next Steps</h3>

                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                    <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Jane AI Summary</span>
                    <p className="text-gray-800 mt-1 leading-relaxed">
                      {call.summary || 'Student showed high interest in the Generative AI curriculum and placement support.'}
                    </p>
                  </div>

                  {call.key_objection && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 text-xs">
                      <span className="text-gray-500">Addressed Concern</span>
                      <span className="font-semibold text-gray-800">{call.key_objection}</span>
                    </div>
                  )}

                  {call.recommended_action && (
                    <div className="p-3 bg-[#EBF981]/40 rounded-xl text-xs text-[#141416] border border-[#EBF981]">
                      <strong>Recommended Action:</strong> {call.recommended_action}
                    </div>
                  )}

                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-xs">
                    <span className="text-gray-500">Student Sentiment</span>
                    <span className="font-semibold text-emerald-600">{call.sentiment || 'Interested'}</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 text-xs">
                    <span className="text-gray-500">Lead Qualification</span>
                    <span className="font-bold text-[#141416]">{call.lead_score || 80}/100</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] p-12 text-center shadow-soft border border-gray-100 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-xl text-gray-400">
                📞
              </div>
              <h3 className="text-base font-bold text-[#141416]">No Call Selected</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Select any interested candidate from the directory on the left or enter a custom phone number to review their communications history.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
