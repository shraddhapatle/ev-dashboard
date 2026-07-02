import React from 'react'
import Icon from './Icon'
import { station as defaultStation } from '../data/twinModel'

const DOT = { critical: 'status-crit', warning: 'status-warn', ok: 'status-ok' }

function KernelChip({ label, value, tone = 'teal' }) {
  // Use steel/slate color for normal kernel stats, only warm/alert colors for warning
  const color = tone === 'warn' ? '#f5b544' : '#e2e8f0'
  return (
    <div className="inner-carve px-3 py-1.5 flex flex-col min-w-[78px]">
      <span className="font-mono text-[9px] tracking-widest text-slate-500 uppercase">
        {label}
      </span>
      <span className="font-mono text-[14px] font-semibold" style={{ color }}>
        {value}
      </span>
    </div>
  )
}

export default function TopBar({ onOpenMap, onLogout, station = defaultStation }) {
  const k = station.kernel
  return (
    <header className="glass-panel-heavy wall-glow pointer-events-auto flex items-center justify-between px-6 h-[68px] rounded-2xl">
      {/* brand */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-800 border border-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            style={{ 
              borderTop: '1px solid rgba(255,255,255,0.12)',
              borderBottom: '1px solid rgba(0,0,0,0.6)'
            }}>
            <Icon name="hub" className="text-slate-300" fill={1} size={20} />
          </div>
          <div className="leading-none">
            <div className="font-mono text-[9px] tracking-[0.25em] text-slate-500 uppercase">
              Sajag
            </div>
            <div className="font-poppins text-[18px] font-bold text-slate-200 glow-text-primary -mt-0.5">
              Tactical Command
            </div>
          </div>
        </div>
        
        {/* view nav */}
        <div className="flex items-center gap-1 inner-carve p-1 rounded-xl">
          <span className="px-3 py-1.5 rounded-lg bg-slate-800 border-t border-white/5 border-b border-black/40 font-mono text-[10px] tracking-widest text-slate-200 uppercase flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.3)]">
            <Icon name="deployed_code" size={14} fill={1} style={{ color: '#94a3b8' }} /> Digital Twin
          </span>
          <button
            onClick={onOpenMap}
            className="px-3 py-1.5 rounded-lg font-mono text-[10px] tracking-widest text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 uppercase flex items-center gap-1.5 transition-colors"
          >
            <Icon name="map" size={14} /> Map
          </button>
        </div>
      </div>

      {/* station identity */}
      <div className="hidden lg:flex flex-col items-center leading-tight max-w-[360px]">
        <div className="flex items-center gap-2">
          <span className={`status-dot ${DOT[station.status] || 'status-ok'}`} />
          <span className="font-poppins text-[14px] font-medium text-slate-300 truncate">
            {station.name}
          </span>
        </div>
        <span className="font-mono text-[9px] tracking-wider text-slate-500 truncate max-w-[340px]">
          {station.station_id} · {station.location}
        </span>
      </div>

      {/* kernel metrics */}
      <div className="flex items-center gap-2.5">
        <KernelChip label="Grid Stab" value={k.grid_stability_factor.toFixed(2)} />
        <KernelChip label="Resilience" value={`${Math.round(k.system_resilience_score * 100)}%`} />
        <KernelChip label="Uptime" value={`${k.fleet_uptime_pct}%`} />
        <div className="relative">
          <button className="p-2 rounded-full hover:bg-slate-800/50 transition-colors text-slate-400 hover:text-slate-200">
            <Icon name="notifications" size={20} />
          </button>
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-error text-on-error text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(255,92,92,0.8)]">
            {k.active_anomalies}
          </span>
        </div>
        <div className="w-9 h-9 rounded-full border border-slate-700 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.4)] bg-slate-800 flex items-center justify-center"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.12)',
            borderBottom: '1px solid rgba(0,0,0,0.6)'
          }}>
          <Icon name="person" className="text-slate-300" size={18} />
        </div>
        {onLogout && (
          <button onClick={onLogout} title="Log out" className="p-2 rounded-full hover:bg-slate-800/50 transition-colors text-slate-400 hover:text-slate-200">
            <Icon name="logout" size={18} />
          </button>
        )}
      </div>
    </header>
  )
}
