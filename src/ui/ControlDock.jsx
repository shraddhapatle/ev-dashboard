import React from 'react'
import Icon from './Icon'

const EV_GREEN = '#39ff6a'

function ToggleButton({ active, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono text-[11px] tracking-wider uppercase transition-all ${
        active
          ? 'bg-[rgba(57,255,106,0.14)] text-[#39ff6a] shadow-[inset_0_0_0_1px_rgba(57,255,106,0.5),0_0_16px_rgba(57,255,106,0.2)]'
          : 'text-on-surface-variant hover:text-[#39ff6a] hover:bg-[rgba(57,255,106,0.06)] hover:shadow-[inset_0_0_0_1px_rgba(57,255,106,0.25)] border border-white/5'
      }`}
    >
      <Icon name={icon} size={17} fill={active ? 1 : 0} />
      {label}
    </button>
  )
}

export default function ControlDock({
  explode,
  setExplode,
  isolate,
  setIsolate,
  autoRotate,
  setAutoRotate,
  selectedId,
  onReset,
  onIsolateAnomaly,
}) {
  const pct = Math.round(explode * 100)
  return (
    <div className="glass-panel-heavy wall-glow pointer-events-auto rounded-2xl px-4 py-3.5 flex items-center gap-4 w-[900px] max-w-[96vw]">
      {/* Isolate Anomaly — the wow-flow CTA */}
      <button
        onClick={onIsolateAnomaly}
        className="shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-mono text-[11px] tracking-wider uppercase font-bold text-error border border-error/50 bg-error/10 hover:bg-error/20 transition-all shadow-[0_0_18px_rgba(255,92,92,0.25)]"
      >
        <Icon name="my_location" size={17} fill={1} /> Isolate Anomaly
      </button>
      <div className="w-px h-12 bg-white/10 shrink-0" />
      {/* assembly-vector slider */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="min-w-0 truncate whitespace-nowrap font-mono text-[10px] tracking-widest text-on-surface-variant uppercase flex items-center gap-1.5">
            <Icon name="open_in_full" size={14} className="shrink-0 text-[#39ff6a]" />
            <span className="truncate">Assembly Vectors</span>
          </span>
          <span className="shrink-0 font-mono text-[12px] font-semibold text-[#39ff6a]">
            {pct.toString().padStart(3, '0')}%
          </span>
        </div>
        <input
          type="range"
          className="neon-range"
          min={0}
          max={1}
          step={0.01}
          value={explode}
          onChange={(e) => setExplode(parseFloat(e.target.value))}
        />
        <div className="flex justify-between font-mono text-[9px] tracking-wider text-on-surface-variant/70 mt-1">
          <span>ASSEMBLED</span>
          <span>EXPLODED</span>
        </div>
      </div>

      <div className="w-px h-12 bg-white/10 shrink-0" />

      {/* quick actions */}
      <div className="shrink-0 flex items-center gap-1.5">
        <ToggleButton
          active={explode < 0.02}
          icon="compress"
          label="Assemble"
          onClick={() => setExplode(0)}
        />
        <ToggleButton
          active={explode > 0.98}
          icon="open_in_full"
          label="Explode"
          onClick={() => setExplode(1)}
        />
        <ToggleButton
          active={isolate}
          icon="filter_center_focus"
          label="Isolate"
          onClick={() => setIsolate((v) => !v)}
        />
        <ToggleButton
          active={autoRotate}
          icon="360"
          label="Orbit"
          onClick={() => setAutoRotate((v) => !v)}
        />
        <button
          onClick={onReset}
          title="Reset view"
          className="shrink-0 p-2 rounded-xl text-on-surface-variant hover:text-[#39ff6a] hover:bg-[rgba(57,255,106,0.06)] hover:shadow-[inset_0_0_0_1px_rgba(57,255,106,0.25)] border border-white/5 transition-all"
        >
          <Icon name="restart_alt" size={18} />
        </button>
      </div>
    </div>
  )
}
