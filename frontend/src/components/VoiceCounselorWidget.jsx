import React, { useState, useEffect, useRef } from 'react';
import { voiceChat, transcribeAudio } from '../lib/api';

const LANGUAGES = [
  { code: 'en-IN', name: 'English', label: 'English', flag: '🇬🇧' },
  { code: 'hi-IN', name: 'Hindi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'Tamil', label: 'தமிழ்', flag: '🇮🇳' },
];

const QUICK_QUESTIONS = {
  'en-IN': [
    'What are the fees and 0% EMI options for GenAI?',
    'I have no coding experience. Can I join?',
    'Tell me about your 100% placement guarantee & hiring partners',
    'What is the duration, syllabus & weekend schedule?',
    'Do you teach Transformers, RAG, CrewAI Agents & LangChain?',
    'Will I get access to high-end Cloud GPUs for training?',
    'What is the average salary package for course graduates?',
    'Are live classes recorded if I miss a weekend session?',
    'Is there 1-on-1 resume review & mock interview prep?',
    'Can I get a scholarship after taking an AI assessment?',
    'Please book a 1-on-1 demo call with a senior mentor',
  ],
  'hi-IN': [
    'Generative AI कोर्स की फीस और EMI क्या है?',
    'मैं नॉन-कोडिंग बैकग्राउंड से हूँ, क्या मैं सीख सकता हूँ?',
    'प्लेसमेंट गारंटी और हायरिंग कंपनियों के बारे में बताइए',
    'कोर्स का ड्यूरेशन और वीकेंड क्लास का समय क्या है?',
    'क्या आप Transformers, RAG और CrewAI प्रैक्टिकल सिखाते हैं?',
    'क्या मॉडल्स ट्रेन करने के लिए Cloud GPU एक्सेस मिलेगा?',
    'कोर्स पूरा करने के बाद एवरेज सैलरी पैकेज क्या होता है?',
    'अगर मेरी क्लास छूट जाए तो क्या रिकॉर्डिंग मिलेगी?',
    'क्या इंटरव्यू की तैयारी और 1-on-1 मेंटरशिप मिलेगी?',
    'क्या मुझे टेस्ट के बाद स्कॉलरशिप मिल सकती है?',
    'कृपया मेरा 1-on-1 मेंटर डेमो सेशन बुक करें',
  ],
  'ta-IN': [
    'Generative AI course fee matrum EMI details solla mudiyuma?',
    'Coding theriyadhavanga padikka mudiyuma?',
    '100% Placement Support matrum hiring partners pathi sollunga',
    'Course duration matrum weekend class timings enna?',
    'Transformers, RAG matrum CrewAI hands-on projects irukka?',
    'Model training-ku Cloud GPU access kedaikkuma?',
    'Course mudicha piragu average salary package enna?',
    'Class miss aana recordings kedaikkuma?',
    '1-on-1 Mock Interview matrum Resume guidance irukka?',
    'Scholarship test eppadi ezhuthuvadhu?',
    'Enakku oru 1-on-1 AI mentor demo slot book pannunga',
  ],
};

// Encode Float32 PCM samples into a standard 16-bit Mono WAV Blob
function encodeWAV(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // Linear PCM
  view.setUint16(22, 1, true); // Mono channel
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate (sampleRate * 1 channel * 2 bytes)
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // 16-bit
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([view], { type: 'audio/wav' });
}

export default function VoiceCounselorWidget({ onAppointmentBooked }) {
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [micStatusMsg, setMicStatusMsg] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 9));
  const [messages, setMessages] = useState([
    {
      speaker: 'ai',
      text: 'Hello! I am Jane, your AI Course Counselor at Jane AI Academy. How can I help you accelerate your career with Generative AI and Machine Learning today?',
      sentiment: 'Enthusiastic',
      score: 75,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [latestAppointment, setLatestAppointment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const processorRef = useRef(null);
  const sampleRateRef = useRef(44100);
  const recordedSamplesRef = useRef([]);
  const isRecordingRef = useRef(false);
  const chatScrollRef = useRef(null);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing, isListening, isTranscribing]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopVoiceRecording(false);
    };
  }, []);

  // Start Voice Recording via Web Audio API (cross-browser, independent of Chrome speech servers)
  const startVoiceRecording = async () => {
    setMicStatusMsg('');
    setInterimText('');
    recordedSamplesRef.current = [];

    // Cancel active TTS playback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      sampleRateRef.current = audioCtx.sampleRate;
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      // Buffer size 4096, 1 input channel, 1 output channel
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      isRecordingRef.current = true;
      setIsListening(true);
      setMicStatusMsg('🎙️ Recording your voice... Speak your question, then click "Stop & Send".');

      processor.onaudioprocess = (e) => {
        if (!isRecordingRef.current) return;
        const channelData = e.inputBuffer.getChannelData(0);
        recordedSamplesRef.current.push(new Float32Array(channelData));
      };

      // Connect through silent gain to destination to avoid speaker feedback
      const silentGain = audioCtx.createGain();
      silentGain.gain.value = 0;
      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(audioCtx.destination);
    } catch (err) {
      console.error('Microphone error:', err);
      setMicStatusMsg('⚠️ Microphone access error. Please ensure microphone permissions are allowed in your browser.');
      setIsListening(false);
    }
  };

  // Stop Voice Recording and Transcribe Audio
  const stopVoiceRecording = async (shouldSend = true) => {
    isRecordingRef.current = false;
    setIsListening(false);

    // Stop script processor & audio stream
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (e) {}
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }

    if (!shouldSend) {
      recordedSamplesRef.current = [];
      return;
    }

    const chunks = recordedSamplesRef.current;
    recordedSamplesRef.current = [];

    // Calculate total length
    let totalLength = 0;
    for (let i = 0; i < chunks.length; i++) {
      totalLength += chunks[i].length;
    }

    // Require at least ~0.3 seconds of recorded audio
    const minSamples = Math.floor((sampleRateRef.current || 44100) * 0.3);
    if (totalLength < minSamples) {
      setMicStatusMsg('No speech detected. Please click the mic and speak your question.');
      return;
    }

    // Flatten chunks
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (let i = 0; i < chunks.length; i++) {
      merged.set(chunks[i], offset);
      offset += chunks[i].length;
    }

    // Encode to WAV with actual sample rate
    const currentSampleRate = sampleRateRef.current || 44100;
    const wavBlob = encodeWAV(merged, currentSampleRate);

    // Send audio to backend for transcription
    setIsTranscribing(true);
    setMicStatusMsg('⚡ Understanding your voice...');

    try {
      const formData = new FormData();
      formData.append('audio', wavBlob, 'user_query.wav');
      formData.append('language', selectedLang);

      const res = await transcribeAudio(formData);
      setIsTranscribing(false);

      if (res && res.success && res.transcript && res.transcript.trim()) {
        setMicStatusMsg('');
        handleSendMessage(res.transcript.trim());
      } else {
        setMicStatusMsg(res?.error || 'Could not understand audio. Please click the mic and speak clearly, or pick a question below.');
      }
    } catch (err) {
      console.error('Audio transcription request failed:', err);
      setIsTranscribing(false);
      setMicStatusMsg('Voice server is connecting. Please make sure the backend is active.');
    }
  };

  // Toggle Mic button
  const handleMicToggle = () => {
    if (isListening) {
      stopVoiceRecording(true);
    } else {
      startVoiceRecording();
    }
  };

  // Text-to-Speech (TTS)
  const speakText = (text, langCode) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const targetLang = langCode.split('-')[0];
      const matchVoice = voices.find((v) => v.lang.startsWith(targetLang));
      if (matchVoice) {
        utterance.voice = matchVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS playback error:', e);
      setIsSpeaking(false);
    }
  };

  // Send message to backend
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isProcessing) return;

    setInputText('');
    setInterimText('');

    const userMsg = {
      speaker: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const response = await voiceChat({
        user_text: text,
        language: selectedLang,
        session_id: sessionId,
        lead_name: 'Prospective Student',
      });

      const aiMsg = {
        speaker: 'ai',
        text: response.reply_text,
        sentiment: response.sentiment,
        score: response.qualification_score,
        appointment_booked: response.appointment_booked,
        booking_details: response.booking_details,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Speak AI response out loud via TTS
      speakText(response.reply_text, response.language || selectedLang);

      // Handle auto appointment booking
      if (response.appointment_booked && response.booking_details) {
        setLatestAppointment(response.booking_details);
        if (onAppointmentBooked) onAppointmentBooked(response.booking_details);
      }
    } catch (err) {
      console.error('Voice chat request failed:', err);
      const errorMsg = {
        speaker: 'ai',
        text: 'I could not connect to the voice server. Please check that the backend is running.',
        sentiment: 'Neutral',
        score: 50,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#141416] text-white rounded-[2.5rem] p-6 shadow-2xl flex flex-col justify-between border border-gray-800 relative overflow-hidden">
      {/* Background Central Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#EBF981]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Controls */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-[#EBF981] text-[#141416]'
                }`}
              >
                <svg fill="none" height="20" width="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </div>
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EBF981] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#EBF981]" />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold tracking-tight text-white">Live AI Voice Counselor — Jane AI</h3>
                <span className="bg-[#EBF981]/20 text-[#EBF981] text-xs px-2.5 py-0.5 rounded-full font-medium border border-[#EBF981]/30">
                  Direct Microphone STT & TTS
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Real-time voice counseling in English, Hindi & Tamil with placement support
              </p>
            </div>
          </div>

          {/* Controls: Language, Audio & Primary Mic Button */}
          <div className="flex items-center gap-2">
            {/* Header Direct Mic Trigger */}
            <button
              onClick={handleMicToggle}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse ring-4 ring-red-500/40'
                  : 'bg-[#EBF981] hover:bg-[#d8e66e] text-[#141416]'
              }`}
            >
              <svg fill="none" height="16" width="16" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
              <span>{isListening ? '🛑 Stop Recording & Send' : '🎙️ Open Mic'}</span>
            </button>

            {/* Language Selector */}
            <div className="flex bg-[#232325] p-1 rounded-xl border border-gray-700 text-xs">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    selectedLang === lang.code ? 'bg-[#EBF981] text-[#141416]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="mr-1">{lang.flag}</span>
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Sound Toggle Button */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (soundEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
              }}
              title={soundEnabled ? 'Mute AI Voice' : 'Unmute AI Voice'}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition border ${
                soundEnabled ? 'bg-[#232325] border-gray-700 text-[#EBF981]' : 'bg-red-950/40 border-red-800 text-red-400'
              }`}
            >
              {soundEnabled ? (
                <svg fill="none" height="15" width="15" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              ) : (
                <svg fill="none" height="15" width="15" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Demo Booking Banner if triggered */}
        {latestAppointment && (
          <div className="mt-3 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-200 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="text-base">🎉</span>
              <div>
                <span className="font-semibold text-emerald-300">1-on-1 AI Mentor Demo Booked!</span>
                <span className="ml-2 text-gray-300">
                  {latestAppointment.slot_date} at {latestAppointment.slot_time} with {latestAppointment.counselor}
                </span>
              </div>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              Confirmed
            </span>
          </div>
        )}

        {/* Status notification / Mic message */}
        {micStatusMsg && (
          <div className="mt-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
            <span>{micStatusMsg}</span>
            <button onClick={() => setMicStatusMsg('')} className="text-amber-400 hover:text-white ml-2 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Transcript Conversation View */}
        <div
          ref={chatScrollRef}
          className="my-4 h-64 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.speaker === 'user' ? 'items-end' : 'items-start'} transition-all`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-md ${
                  msg.speaker === 'user'
                    ? 'bg-[#EBF981] text-[#141416] font-medium rounded-br-xs'
                    : 'bg-[#232325] text-gray-100 border border-gray-700/60 rounded-bl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1 text-xs opacity-75">
                  <span className="font-semibold">{msg.speaker === 'user' ? 'You (Student)' : 'Jane AI Counselor'}</span>
                  <span>{msg.time}</span>
                </div>
                <p className="whitespace-pre-line">{msg.text}</p>
                {msg.sentiment && (
                  <div className="mt-2 flex items-center gap-2 pt-1 border-t border-gray-700/40 text-xs">
                    <span className="px-2 py-0.5 bg-black/30 rounded-full text-gray-300">
                      Sentiment: <strong className="text-[#EBF981]">{msg.sentiment}</strong>
                    </span>
                    {msg.score && (
                      <span className="px-2 py-0.5 bg-black/30 rounded-full text-gray-300">
                        Lead Score: <strong>{msg.score}/100</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Real-time Voice Recording Banner */}
          {isListening && (
            <div className="flex flex-col items-end">
              <div className="bg-[#EBF981]/15 border border-[#EBF981]/50 text-white rounded-2xl p-3.5 text-sm flex items-center gap-3 animate-pulse shadow-lg">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="font-semibold text-[#EBF981]">
                  Recording your microphone... Speak your question now!
                </span>
                <button
                  onClick={() => stopVoiceRecording(true)}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-xl font-bold transition ml-2 shadow-md cursor-pointer"
                >
                  🛑 Click to Stop & Send
                </button>
              </div>
            </div>
          )}

          {isTranscribing && (
            <div className="flex items-center gap-2 text-xs text-amber-300 pl-2">
              <div className="animate-spin w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full" />
              <span>Transcribing your audio recording...</span>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-gray-400 pl-2">
              <div className="animate-spin w-4 h-4 border-2 border-[#EBF981] border-t-transparent rounded-full" />
              <span>Jane AI Counselor is answering your question...</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Quick Chips, Mic Button & Input */}
      <div className="space-y-3 pt-2 border-t border-gray-800">
        {/* Quick Questions Queue Header */}
        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span className="font-semibold text-gray-300">💡 Or Click Any Question from the Queue:</span>
          <span>{QUICK_QUESTIONS[selectedLang]?.length || 11} questions</span>
        </div>

        {/* Quick Questions Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 text-xs scrollbar-thin scrollbar-thumb-gray-800">
          {(QUICK_QUESTIONS[selectedLang] || QUICK_QUESTIONS['en-IN']).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1.5 bg-[#232325] hover:bg-[#2e2e32] text-gray-300 hover:text-white rounded-full whitespace-nowrap border border-gray-700/70 transition shrink-0 hover:border-[#EBF981]/50"
            >
              💬 {q}
            </button>
          ))}
        </div>

        {/* Input Bar with Primary Toggle Microphone */}
        <div className="flex items-center gap-2">
          {/* Main Voice Microphone Button (Click to start, Click to stop & send) */}
          <button
            onClick={handleMicToggle}
            className={`h-12 px-5 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all duration-300 shrink-0 shadow-lg ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse ring-4 ring-red-500/40'
                : 'bg-[#EBF981] hover:bg-[#d8e66e] text-[#141416]'
            }`}
            title={isListening ? 'Click to Stop Recording and Send Question' : 'Click to Speak via Microphone'}
          >
            {isListening ? (
              <>
                <svg fill="currentColor" height="20" width="20" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                <span className="text-xs">Stop & Send</span>
              </>
            ) : (
              <>
                <svg fill="none" height="20" width="20" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
                <span className="text-xs">Speak</span>
              </>
            )}
          </button>

          {/* Text Input for Typing fallback */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isListening ? 'Recording your voice... Click Stop & Send when done' : 'Type or click Speak to ask via microphone…'}
              className="w-full bg-[#232325] text-white text-sm rounded-2xl pl-4 pr-12 py-3 border border-gray-700 focus:outline-none focus:border-[#EBF981] placeholder-gray-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isProcessing}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#EBF981] text-[#141416] flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition"
            >
              <svg fill="none" height="15" width="15" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {isListening && (
          <div className="flex items-center justify-between px-2 text-xs text-red-400 font-medium py-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Recording your microphone ({selectedLang}) — speak naturally now</span>
            </div>
            <button
              onClick={() => stopVoiceRecording(true)}
              className="underline hover:text-white text-xs font-semibold"
            >
              Click when finished speaking to send →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
