import React, { useState } from 'react'
import Icon from './Icon'

const STEEL_BLUE = '#cbd5e1'
const STEEL_BLUE_DIM = '#94a3b8'
const EV_GREEN = '#39ff6a'
const WARN = '#f5b544'
const CRIT = '#ff5c5c'

function stateColor(s) {
  return s === 'critical' ? CRIT : s === 'warning' ? WARN : EV_GREEN
}

function MiniLine({ data, color = STEEL_BLUE, h = 50 }) {
  if (!data?.length) return null
  const w = 300, max = Math.max(...data), min = Math.min(...data)
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 8) - 4}`
  ).join(' ')
  const id = `gl${color.replace(/\W/g, '')}`
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" />
    </svg>
  )
}

function MiniBar({ data, color = STEEL_BLUE, h = 50 }) {
  if (!data?.length) return null
  const max = Math.max(...data), bw = Math.floor(280 / data.length) - 2
  return (
    <svg width="100%" viewBox={`0 0 280 ${h}`} preserveAspectRatio="none">
      {data.map((v, i) => {
        const bh = (v / (max || 1)) * (h - 6)
        return <rect key={i} x={i * (bw + 2)} y={h - bh} width={bw} height={bh}
          fill={color} fillOpacity="0.65" rx="2" />
      })}
    </svg>
  )
}

function Kpi({ label, value, unit, icon, color = STEEL_BLUE, sub }) {
  return (
    <div className="rounded-xl p-3 flex flex-col gap-0.5"
      style={{ 
        background: 'rgba(255,255,255,0.02)', 
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderLeft: '1px solid rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(0,0,0,0.4)',
        borderRight: '1px solid rgba(0,0,0,0.4)',
        boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.01)'
      }}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon name={icon} size={12} style={{ color: STEEL_BLUE_DIM }} fill={1} />
        <span className="font-mono text-[9px] tracking-widest uppercase text-slate-500">{label}</span>
      </div>
      <div className="font-mono text-[18px] font-bold leading-none text-slate-100">
        {value}<span className="text-[10px] font-normal ml-0.5 text-slate-500">{unit}</span>
      </div>
      {sub && <div className="font-mono text-[8.5px] mt-0.5 text-slate-500">{sub}</div>}
    </div>
  )
}

function ChartCard({ title, icon, color, children, labels }) {
  return (
    <div className="rounded-xl p-3" 
      style={{ 
        background: 'rgba(15,20,25,0.65)', 
        borderTop: '1.5px solid rgba(255,255,255,0.06)',
        borderLeft: '1px solid rgba(255,255,255,0.03)',
        borderBottom: '1.5px solid rgba(0,0,0,0.5)',
        borderRight: '1.5px solid rgba(0,0,0,0.5)'
      }}>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon name={icon} size={12} style={{ color: STEEL_BLUE_DIM }} fill={1} />
        <span className="font-mono text-[9px] tracking-widest uppercase text-slate-400">{title}</span>
      </div>
      {children}
      {labels && (
        <div className="flex justify-between mt-1 font-mono text-[8px] text-slate-600">
          {labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      )}
    </div>
  )
}

export default function StationAnalyticsPanel({ station, onClose, onOpenTwin, onOpenDetails }) {
  const [tab, setTab] = useState('overview')
  if (!station) return null

  const p = station.performance || {}
  const s = station.sensors || {}
  const m = { 
    online: { color: EV_GREEN, label: 'Online' }, 
    warning: { color: WARN, label: 'Warning' }, 
    critical: { color: CRIT, label: 'Critical' }, 
    offline: { color: '#64748b', label: 'Offline' } 
  }[station.status] || { color: EV_GREEN, label: 'Online' }
  
  const col = m.color
  const util = p.util ?? 0
  const utilColor = util >= 70 ? EV_GREEN : util >= 40 ? WARN : CRIT

  const TABS = ['overview', 'charts', 'maintenance']

  return (
    <div className="absolute inset-0 z-[1500] flex items-stretch pointer-events-none">
      {/* Backdrop */}
      <div className="flex-1 pointer-events-auto" onClick={onClose}
        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(1px)' }} />

      {/* Panel */}
      <div className="w-[420px] shrink-0 h-full flex flex-col pointer-events-auto overflow-hidden"
        style={{ 
          background: 'rgba(20,24,28,0.98)', 
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)', 
          boxShadow: '-8px 0 32px rgba(0,0,0,0.6)' 
        }}>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 shrink-0 border-b border-white/5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ 
                  background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)', 
                  borderTop: '1px solid rgba(255,255,255,0.12)',
                  borderBottom: '1px solid rgba(0,0,0,0.5)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                <Icon name="ev_station" size={20} style={{ color: '#cbd5e1' }} fill={1} />
              </div>
              <div className="min-w-0">
                <div className="font-poppins text-[15px] font-semibold leading-tight text-slate-100 truncate">
                  {station.Name}
                </div>
                <div className="font-mono text-[9px] mt-0.5 text-slate-500 truncate">
                  {station.city}{station.address ? ` · ${station.address}` : ''}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="hover:text-slate-200 transition-colors text-slate-500">
              <Icon name="close" size={20} />
            </button>
          </div>

          {/* Status + ID row */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[9px] font-semibold"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: col, boxShadow: `0 0 5px ${col}` }} />
              {m.label}
            </span>
            <span className="font-mono text-[9px] text-slate-500">ID: {station.id}</span>
            <span className="font-mono text-[9px] text-slate-500">{station.capacity_kw ?? 50} kW</span>
            
            <div className="ml-auto flex items-center gap-1.5">
              {onOpenDetails && (
                <button onClick={() => { onClose(); onOpenDetails(station) }}
                  className="cta-button flex items-center gap-1 px-2 py-1 rounded-lg font-mono text-[9px] font-semibold text-slate-200">
                  <Icon name="analytics" size={12} />Full View
                </button>
              )}
              <button onClick={() => { onClose(); onOpenTwin(station) }}
                className="cta-button flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[9px] font-semibold text-slate-200">
                <Icon name="hub" size={13} fill={1} />Digital Twin
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-1.5 rounded-lg font-mono text-[10px] capitalize transition-all"
                style={{
                  background: tab === t ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  border: `1px solid ${tab === t ? 'rgba(255,255,255,0.15)' : 'transparent'}`,
                  color: tab === t ? '#f8fafc' : '#94a3b8',
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3"
          style={{ scrollbarWidth: 'thin' }}>

          {/* ── OVERVIEW TAB ── */}
          {tab === 'overview' && <>
            {/* Utilization gauge bar */}
            <div className="rounded-xl p-4" 
              style={{ 
                background: 'rgba(15,20,25,0.65)', 
                borderTop: '1.5px solid rgba(255,255,255,0.06)',
                borderLeft: '1px solid rgba(255,255,255,0.03)',
                borderBottom: '1.5px solid rgba(0,0,0,0.5)',
                borderRight: '1.5px solid rgba(0,0,0,0.5)'
              }}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                  <Icon name="speed" size={13} style={{ color: STEEL_BLUE_DIM }} fill={1} />
                  <span className="font-mono text-[9px] tracking-widest uppercase text-slate-500">Utilization Rate</span>
                </div>
                <span className="font-mono text-[20px] font-bold text-slate-200">{util}<span className="text-[12px] ml-0.5 text-slate-500">%</span></span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${util}%`, background: `linear-gradient(90deg, ${utilColor}aa, ${utilColor})` }} />
              </div>
              <div className="flex justify-between mt-1 font-mono text-[8px] text-slate-600">
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </div>

            {/* KPI grid */}
            <div className="grid grid-cols-2 gap-2">
              <Kpi label="Power Output" value={p.power_output_kw ?? '—'} unit="kW" icon="bolt" sub={`of ${station.capacity_kw ?? 50} kW capacity`} />
              <Kpi label="Energy Today" value={p.energy_today_kwh ?? '—'} unit="kWh" icon="electric_meter" sub="cumulative 24h" />
              <Kpi label="Revenue Today" value={p.revenue_today_inr ? `₹${p.revenue_today_inr.toLocaleString('en-IN')}` : '—'} unit="" icon="currency_rupee" sub="@₹12.5/kWh" />
              <Kpi label="CO₂ Saved" value={p.co2_saved_kg ?? '—'} unit="kg" icon="eco" sub="vs ICE vehicles" />
              <Kpi label="Sessions Today" value={p.sessions_today ?? '—'} unit="" icon="ev_charger" sub={`avg ${p.avg_session_min ?? '—'} min/session`} />
              <Kpi label="AI Risk Score" value={s.ai_risk_score ?? '—'} unit="/100" icon="psychology" sub="predictive model" />
            </div>

            {/* Charger availability */}
            <div className="rounded-xl p-4" 
              style={{ 
                background: 'rgba(15,20,25,0.65)', 
                borderTop: '1.5px solid rgba(255,255,255,0.06)',
                borderLeft: '1px solid rgba(255,255,255,0.03)',
                borderBottom: '1.5px solid rgba(0,0,0,0.5)',
                borderRight: '1.5px solid rgba(0,0,0,0.5)'
              }}>
              <div className="flex items-center gap-1.5 mb-3">
                <Icon name="ev_station" size={13} style={{ color: STEEL_BLUE_DIM }} fill={1} />
                <span className="font-mono text-[9px] tracking-widest uppercase text-slate-400">Charger Availability</span>
              </div>
              <div className="flex gap-2">
                {Array.from({ length: p.total_ports ?? 4 }).map((_, i) => {
                  const avail = i < (p.ports_available ?? 0)
                  return (
                    <div key={i} className="flex-1 rounded-lg py-2.5 flex flex-col items-center gap-1"
                      style={{ 
                        background: avail ? 'rgba(57,255,106,0.04)' : 'rgba(255,255,255,0.02)', 
                        border: `1px solid ${avail ? 'rgba(57,255,106,0.2)' : 'rgba(255,255,255,0.08)'}` 
                      }}>
                      <Icon name={avail ? 'power' : 'power_off'} size={15} style={{ color: avail ? EV_GREEN : '#64748b' }} fill={1} />
                      <span className="font-mono text-[8px]" style={{ color: avail ? EV_GREEN : '#64748b' }}>{avail ? 'Free' : 'Busy'}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-2 font-mono text-[9px] text-center text-slate-500">
                {p.ports_available ?? 0} / {p.total_ports ?? 4} ports available
              </div>
            </div>

            {/* Sensor matrix */}
            <div className="rounded-xl p-4" 
              style={{ 
                background: 'rgba(15,20,25,0.65)', 
                borderTop: '1.5px solid rgba(255,255,255,0.06)',
                borderLeft: '1px solid rgba(255,255,255,0.03)',
                borderBottom: '1.5px solid rgba(0,0,0,0.5)',
                borderRight: '1.5px solid rgba(0,0,0,0.5)'
              }}>
              <div className="flex items-center gap-1.5 mb-3">
                <Icon name="sensors" size={13} style={{ color: STEEL_BLUE_DIM }} fill={1} />
                <span className="font-mono text-[9px] tracking-widest uppercase text-slate-400">Sensor Matrix</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Rectifier Temp', value: `${s.rectifier_temp_c ?? '—'}°C`, warn: (s.rectifier_temp_c ?? 0) > 70 },
                  { label: 'Fan Vibration',  value: `${s.fan_vibration_hz ?? '—'} Hz`,  warn: (s.fan_vibration_hz ?? 0) > 35 },
                  { label: 'Voltage Sag',    value: `${s.voltage_sag_percent ?? '—'}%`, warn: (s.voltage_sag_percent ?? 0) > 7 },
                  { label: 'Coolant Press.', value: `${s.coolant_pressure_psi ?? '—'} psi`, warn: (s.coolant_pressure_psi ?? 30) < 22 },
                  { label: 'Cable Temp',     value: `${s.cable_temp_c ?? '—'}°C`,       warn: (s.cable_temp_c ?? 0) > 60 },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between items-center px-2.5 py-1.5 rounded-lg bg-black/20">
                    <span className="font-mono text-[9px] text-slate-500">{r.label}</span>
                    <span className="font-mono text-[10px] font-semibold" style={{ color: r.warn ? WARN : '#cbd5e1' }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>}

          {/* ── CHARTS TAB ── */}
          {tab === 'charts' && <>
            <ChartCard title="Utilization Rate — 24h" icon="timeline" color={utilColor} labels={['0h','6h','12h','18h','24h']}>
              <MiniLine data={p.util_series} color={utilColor} h={60} />
            </ChartCard>
            <ChartCard title="Power Output (kW) — 24h" icon="bolt" color={STEEL_BLUE} labels={['0h','6h','12h','18h','24h']}>
              <MiniLine data={p.power_series} color={STEEL_BLUE} h={60} />
            </ChartCard>
            <ChartCard title="Energy Consumption (kWh) — 24h" icon="electric_meter" color={STEEL_BLUE} labels={['0h','6h','12h','18h','24h']}>
              <MiniBar data={p.energy_series} color={STEEL_BLUE_DIM} h={60} />
            </ChartCard>
            {/* Revenue estimate */}
            <div className="rounded-xl p-4" 
              style={{ 
                background: 'rgba(15,20,25,0.65)', 
                borderTop: '1.5px solid rgba(255,255,255,0.06)',
                borderLeft: '1px solid rgba(255,255,255,0.03)',
                borderBottom: '1.5px solid rgba(0,0,0,0.5)',
                borderRight: '1.5px solid rgba(0,0,0,0.5)'
              }}>
              <div className="flex items-center gap-1.5 mb-3">
                <Icon name="currency_rupee" size={13} style={{ color: STEEL_BLUE_DIM }} fill={1} />
                <span className="font-mono text-[9px] tracking-widest uppercase text-slate-400">Revenue Breakdown</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: 'Energy Revenue', value: `₹${p.revenue_today_inr?.toLocaleString('en-IN') ?? '—'}` },
                  { label: 'Session Count',  value: `${p.sessions_today ?? '—'} sessions` },
                  { label: 'Avg Session',    value: `${p.avg_session_min ?? '—'} min` },
                  { label: 'Rate Applied',   value: '₹12.5 / kWh' },
                  { label: 'Projected Monthly', value: `₹${Math.round((p.revenue_today_inr ?? 0) * 30).toLocaleString('en-IN')}` },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between px-3 py-2 rounded-lg bg-black/20">
                    <span className="font-mono text-[9px] text-slate-500">{r.label}</span>
                    <span className="font-mono text-[11px] font-semibold text-slate-200">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>}

          {/* ── MAINTENANCE TAB ── */}
          {tab === 'maintenance' && <>
            <div className="rounded-xl p-4" 
              style={{ 
                background: 'rgba(15,20,25,0.65)', 
                borderTop: '1.5px solid rgba(255,255,255,0.06)',
                borderLeft: '1px solid rgba(255,255,255,0.03)',
                borderBottom: '1.5px solid rgba(0,0,0,0.5)',
                borderRight: '1.5px solid rgba(0,0,0,0.5)'
              }}>
              <div className="flex items-center gap-1.5 mb-3">
                <Icon name="build_circle" size={13} style={{ color: STEEL_BLUE_DIM }} fill={1} />
                <span className="font-mono text-[9px] tracking-widest uppercase text-slate-400">Maintenance History</span>
              </div>
              <div className="flex flex-col gap-2">
                {(p.maintenance_history ?? []).map((h, i) => {
                  const sc = h.status === 'Completed' ? EV_GREEN : h.status === 'In Progress' ? WARN : '#a78bfa'
                  return (
                    <div key={i} className="rounded-lg px-3 py-2.5"
                      style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.06)` }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10.5px] font-semibold text-slate-300">{h.event}</span>
                        <span className="font-mono text-[8px] px-2 py-0.5 rounded-full"
                          style={{ background: `${sc}18`, color: sc }}>{h.status}</span>
                      </div>
                      <div className="flex gap-3 font-mono text-[8px] text-slate-500">
                        <span>📅 {h.date}</span>
                        <span>👷 {h.tech}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Operational summary */}
            <div className="rounded-xl p-4" 
              style={{ 
                background: 'rgba(15,20,25,0.65)', 
                borderTop: '1.5px solid rgba(255,255,255,0.06)',
                borderLeft: '1px solid rgba(255,255,255,0.03)',
                borderBottom: '1.5px solid rgba(0,0,0,0.5)',
                borderRight: '1.5px solid rgba(0,0,0,0.6)'
              }}>
              <div className="flex items-center gap-1.5 mb-3">
                <Icon name="fact_check" size={13} style={{ color: STEEL_BLUE_DIM }} fill={1} />
                <span className="font-mono text-[9px] tracking-widest uppercase text-slate-400">Operational Status</span>
              </div>
              {[
                { label: 'Current Status',      value: m.label,              color: col },
                { label: 'Utilization',         value: `${util}%`,           color: utilColor },
                { label: 'Ports Available',     value: `${p.ports_available ?? 0}/${p.total_ports ?? 4}`, color: '#cbd5e1' },
                { label: 'Power Output',        value: `${p.power_output_kw ?? 0} kW`, color: '#cbd5e1' },
                { label: 'Energy Today',        value: `${p.energy_today_kwh ?? 0} kWh`, color: '#cbd5e1' },
                { label: 'Revenue Today',       value: `₹${p.revenue_today_inr?.toLocaleString('en-IN') ?? 0}`, color: '#cbd5e1' },
                { label: 'Sessions Today',      value: `${p.sessions_today ?? 0}`, color: '#cbd5e1' },
                { label: 'CO₂ Saved',           value: `${p.co2_saved_kg ?? 0} kg`, color: '#cbd5e1' },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                  <span className="font-mono text-[9.5px] text-slate-500">{r.label}</span>
                  <span className="font-mono text-[10.5px] font-semibold" style={{ color: r.color }}>{r.value}</span>
                </div>
              ))}
            </div>
          </>}
        </div>
      </div>
    </div>
  )
}
