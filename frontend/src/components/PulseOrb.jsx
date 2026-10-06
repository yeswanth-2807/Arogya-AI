// Signature visual: a layered "pulse orb" made of concentric rings, a glowing
// coral core, and an ECG-style pulse line — built from CSS/SVG only (no
// external image assets) so it renders instantly and stays crisp at any size.
export default function PulseOrb({ className = "" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* outer glow */}
      <div className="absolute w-72 h-72 rounded-full bg-coral-glow blur-xl" />

      {/* rotating dashed ring */}
      <div className="absolute w-64 h-64 rounded-full border-2 border-dashed border-teal-400/40 animate-[spin_20s_linear_infinite]" />

      {/* pulsing rings */}
      <span className="absolute w-40 h-40 rounded-full border border-coral-400/60 animate-pulseRing" />
      <span
        className="absolute w-40 h-40 rounded-full border border-coral-400/60 animate-pulseRing"
        style={{ animationDelay: "1.2s" }}
      />

      {/* glass core */}
      <div className="relative w-44 h-44 rounded-full glass-dark shadow-floaty flex items-center justify-center animate-float">
        <svg viewBox="0 0 200 100" className="w-28 h-14" fill="none">
          <polyline
            points="0,50 35,50 45,20 60,80 75,10 90,50 200,50"
            stroke="#FF6F5E"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* floating mini capsule chip */}
      <div className="absolute -bottom-2 -right-2 md:right-2 glass-card px-3 py-2 flex items-center gap-2 animate-floatSlow shadow-card">
        <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
        <span className="text-xs font-medium text-ink-soft">Interaction: Safe</span>
      </div>

      {/* floating mini vitals chip */}
      <div
        className="absolute -top-3 -left-3 md:left-2 glass-card px-3 py-2 flex items-center gap-2 animate-float shadow-card"
        style={{ animationDelay: "1.5s" }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-coral-500" />
        <span className="text-xs font-medium text-ink-soft">HbA1c: 5.6%</span>
      </div>
    </div>
  );
}
