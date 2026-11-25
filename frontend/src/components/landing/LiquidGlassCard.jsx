export default function LiquidGlassCard() {
  return (
    <div className="relative w-[210px] h-[210px] translate-y-[-50px] animate-float">
      {/* Glass card */}
      <div className="liquid-glass-card relative w-full h-full rounded-2xl p-5 flex flex-col justify-between overflow-hidden">
        {/* Border frame pseudo-element done via CSS */}
        <div className="liquid-glass-border absolute inset-0 rounded-2xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium tracking-wider text-white/70 border border-[#EBF981]/20 bg-[#EBF981]/10 text-[#EBF981]">
            [  LIVE VOICE AI  ]
          </span>
        </div>

        <div className="relative z-10">
          <h3 className="text-[17px] font-semibold leading-tight text-white/95">
            Jane AI{' '}
            <span className="font-serif italic text-rise-green">Academy</span>{' '}
            Masterclasses
          </h3>
        </div>

        <div className="relative z-10">
          <p className="text-[11px] leading-relaxed text-white/60">
            Real-time Voice Counselor for AI & ML Courses in Hindi, Tamil & English
          </p>
        </div>
      </div>
    </div>
  );
}
