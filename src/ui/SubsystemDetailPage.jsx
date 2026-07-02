import React, { useState } from 'react'
import Icon from './Icon'

const STEEL_BLUE = '#cbd5e1'
const STEEL_BLUE_DIM = '#94a3b8'
const EV_GREEN = '#39ff6a'

// ── SVG chart helpers ─────────────────────────────────────────────────────────
function LineChart({ data, color = STEEL_BLUE, h = 80 }) {
  const w = 400, max = Math.max(...data), min = Math.min(...data)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 10) - 5}`).join(' ')
  const id = `lg${color.replace(/[^a-z0-9]/gi, '')}`
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" style={{ filter: `drop-shadow(0 1px 3px rgba(0,0,0,0.5))` }} />
    </svg>
  )
}

function BarChart({ data, color = STEEL_BLUE, h = 80 }) {
  const max = Math.max(...data), bw = 18, gap = 6
  const totalW = data.length * (bw + gap)
  return (
    <svg width="100%" viewBox={`0 0 ${totalW} ${h}`} preserveAspectRatio="none" className="block">
      {data.map((v, i) => {
        const barH = (v / max) * (h - 8)
        return <rect key={i} x={i * (bw + gap)} y={h - barH} width={bw} height={barH} fill={color} fillOpacity="0.65" rx="3" />
      })}
    </svg>
  )
}

function Gauge({ value, max = 100, color = STEEL_BLUE, label }) {
  const r = 38, cx = 50, cy = 50, pct = value / max
  return (
    <div className="flex flex-col items-center min-w-0">
      <svg viewBox="0 0 100 60" className="w-full max-w-[100px] min-w-[64px]">
        <path d={`M ${cx - r},${cy} A${r},${r} 0 0,1 ${cx + r},${cy}`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeLinecap="round" />
        {pct > 0 && (
          <path d={`M ${cx - r},${cy} A${r},${r} 0 ${pct > 0.5 ? 1 : 0},1 ${cx + r * Math.cos(Math.PI * pct)},${cy - r * Math.sin(Math.PI * pct)}`}
            fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.4))` }} />
        )}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#cbd5e1" fontSize="13" fontWeight="bold" fontFamily="monospace">{value}</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="monospace">{label}</text>
      </svg>
    </div>
  )
}

function KpiCard({ label, value, unit, icon, color = STEEL_BLUE, sub }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-1" 
      style={{ 
        background: 'rgba(255, 255, 255, 0.02)', 
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderLeft: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(0,0,0,0.5)',
        borderRight: '1px solid rgba(0,0,0,0.5)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 1px 1px 0 rgba(255,255,255,0.02)'
      }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon name={icon} size={14} style={{ color: STEEL_BLUE_DIM }} fill={1} />
        <span className="font-mono text-[9px] tracking-widest uppercase text-slate-500">{label}</span>
      </div>
      <div className="font-mono text-[22px] font-bold leading-none text-slate-100">
        {value}<span className="text-[11px] ml-0.5 font-normal text-slate-500">{unit}</span>
      </div>
      {sub && <div className="font-mono text-[9px] mt-1 text-slate-500">{sub}</div>}
    </div>
  )
}

function Section({ title, icon, color = STEEL_BLUE, children }) {
  return (
    <div className="rounded-2xl p-5" 
      style={{ 
        background: 'rgba(15,20,25,0.65)', 
        borderTop: '1.5px solid rgba(255,255,255,0.08)',
        borderLeft: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1.5px solid rgba(0,0,0,0.6)',
        borderRight: '1.5px solid rgba(0,0,0,0.6)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 1px 1px 0 rgba(255,255,255,0.02)'
      }}>
      <div className="flex items-center gap-2 mb-4">
        <Icon name={icon} size={15} style={{ color: STEEL_BLUE_DIM }} fill={1} />
        <span className="font-mono text-[10px] tracking-widest uppercase text-slate-400">{title}</span>
      </div>
      {children}
    </div>
  )
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="font-mono text-[12px] text-slate-300">{label}</span>
      <button onClick={() => onChange(!value)} className="relative w-10 h-5 rounded-full transition-all"
        style={{ 
          background: value ? 'rgba(57,255,106,0.15)' : 'rgba(255,255,255,0.06)', 
          border: `1px solid ${value ? EV_GREEN : 'rgba(255,255,255,0.12)'}`,
          boxShadow: value ? `0 0 8px rgba(57,255,106,0.2)` : 'none'
        }}>
        <span className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
          style={{ left: value ? '20px' : '2px', background: value ? EV_GREEN : '#64748b', boxShadow: value ? `0 0 6px ${EV_GREEN}` : 'none' }} />
      </button>
    </div>
  )
}

// ── Page data ─────────────────────────────────────────────────────────────────
const seed = (n) => Array.from({ length: n }, (_, i) => 0.5 + Math.sin(i / 2.5) * 0.3 + Math.sin(i * 0.7) * 0.2)

const PAGES = {
  power: {
    title: 'Power Grid', icon: 'bolt', color: STEEL_BLUE,
    kpis: [
      { label: 'Grid Voltage',  value: '415',   unit: 'V',   icon: 'electric_bolt',   sub: '±0.5 V tolerance' },
      { label: 'Frequency',     value: '50.02', unit: 'Hz',  icon: 'waves',           sub: 'Nominal 50 Hz' },
      { label: 'Power Factor',  value: '0.97',  unit: 'PF',  icon: 'show_chart',      sub: 'Target > 0.95' },
      { label: 'Load Balance',  value: '94',    unit: '%',   icon: 'balance',         sub: 'Phase imbalance < 2%' },
    ],
    charts: [
      { title: 'Load Demand (24h)',       data: seed(24).map((v) => Math.round(60 + v * 25)),  color: STEEL_BLUE,    type: 'line' },
      { title: 'Phase Voltage (A/B/C)',   data: seed(16).map((v) => Math.round(410 + v * 12)), color: STEEL_BLUE_DIM, type: 'bar' },
    ],
    gauges: [{ label: 'LOAD', value: 94, color: STEEL_BLUE }, { label: 'PF', value: 97, color: STEEL_BLUE_DIM }],
    controls: ['Auto Load Balancing', 'Peak Shaving', 'Demand Response', 'Reactive Power Comp.'],
    alerts: [],
  },
  thermal: {
    title: 'Thermal Management', icon: 'thermostat', color: '#f5b544',
    kpis: [
      { label: 'Avg Cabinet Temp', value: '42.1', unit: '°C',    icon: 'device_thermostat',    sub: 'Threshold 70°C' },
      { label: 'Coolant Flow',     value: '18.4', unit: 'L/min', icon: 'water_drop',           sub: 'Nominal 20 L/min' },
      { label: 'Heat Dissipation', value: '87',   unit: '%',     icon: 'air',                  sub: 'Fan array active' },
      { label: 'Hotspot Count',    value: '1',    unit: 'active', icon: 'local_fire_department', sub: 'Nagpur Station #1' },
    ],
    charts: [
      { title: 'Temperature Trend (24h)', data: seed(24).map((v) => Math.round(38 + v * 8)), color: '#f5b544', type: 'line' },
      { title: 'Coolant Pressure (24h)',  data: seed(16).map((v) => Math.round(24 + v * 6)), color: '#ff8f40', type: 'bar' },
    ],
    gauges: [{ label: 'TEMP %', value: 60, color: '#f5b544' }, { label: 'FLOW %', value: 87, color: '#ff8f40' }],
    controls: ['Active Cooling Mode', 'Fan Speed Auto', 'Coolant Pump Override', 'Thermal Throttling'],
    alerts: [{ text: 'Nagpur Station #1 · Rectifier temp 84.2°C — auto-throttled to 50 kW' }],
  },
  energy: {
    title: 'Energy Analytics', icon: 'energy_savings_leaf', color: STEEL_BLUE,
    kpis: [
      { label: 'Today kWh',   value: '84,210', unit: 'kWh',   icon: 'electric_meter', sub: 'vs 79,400 yesterday' },
      { label: 'Carbon Saved', value: '38.2',  unit: 't CO₂', icon: 'eco',            sub: '↑ 4.2% vs last week' },
      { label: 'Efficiency',   value: '96.4',  unit: '%',     icon: 'trending_up',    sub: 'Target > 95%' },
      { label: 'Peak Demand',  value: '14:30', unit: 'IST',   icon: 'schedule',       sub: 'Est. 2.1 MW peak' },
    ],
    charts: [
      { title: 'Energy Delivered (kWh/24h)', data: seed(24).map((v) => Math.round(2800 + v * 1200)), color: STEEL_BLUE,    type: 'line' },
      { title: 'Carbon Offset (kg/day)',     data: seed(7).map((v) => Math.round(5000 + v * 1500)),  color: EV_GREEN, type: 'bar' }, // Carbon uses semantic green
    ],
    gauges: [{ label: 'EFFIC.', value: 96, color: STEEL_BLUE }, { label: 'GREEN', value: 82, color: EV_GREEN }],
    controls: ['Dynamic Load Scheduling', 'V2G Arbitrage', 'Solar Priority Mode', 'Carbon Reporting'],
    alerts: [],
  },
}

export default function SubsystemDetailPage({ id }) {
  const page = PAGES[id]
  if (!page) return null
  const { title, icon, color, kpis, charts, gauges, controls, alerts } = page
  const [toggles, setToggles] = useState(() => Object.fromEntries(controls.map((c, i) => [c, i % 2 === 0])))

  return (
    <div className="flex-1 h-full overflow-y-auto p-6" style={{ background: 'rgba(10,14,18,0.3)', scrollbarWidth: 'thin' }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" 
          style={{ 
            background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)', 
            borderTop: '1px solid rgba(255,255,255,0.12)',
            borderBottom: '1px solid rgba(0,0,0,0.5)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
          <Icon name={icon} size={22} style={{ color: '#cbd5e1' }} fill={1} />
        </div>
        <div>
          <h1 className="font-poppins text-[20px] font-bold leading-tight text-slate-100">{title}</h1>
          <div className="font-mono text-[10px] text-slate-500">Real-time monitoring · All-India EESL network</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 font-mono text-[9px] text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-slate-400" />
          LIVE
        </div>
      </div>

      {/* Alerts */}
      {alerts.map((a, i) => (
        <div key={i} className="mb-4 flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(245,181,68,0.06)', border: '1px solid rgba(245,181,68,0.2)' }}>
          <Icon name="warning" size={15} style={{ color: '#f5b544' }} fill={1} />
          <span className="font-mono text-[10.5px] text-slate-300">{a.text}</span>
        </div>
      ))}

      {/* KPI grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        {kpis.map((k) => <KpiCard key={k.label} {...k} color={color} />)}
      </div>

      {/* Gauges + Charts row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Section title="Dial Indicators" icon="speed" color={color}>
          <div className="flex flex-wrap justify-around gap-3 min-w-0">
            {gauges.map((g) => <Gauge key={g.label} {...g} />)}
          </div>
        </Section>
        <Section title={charts[0].title} icon="timeline" color={color}>
          <LineChart data={charts[0].data} color={charts[0].color} />
          <div className="flex justify-between mt-1 font-mono text-[8px] text-slate-600">
            <span>0h</span><span>12h</span><span>24h</span>
          </div>
        </Section>
        <Section title={charts[1].title} icon="bar_chart" color={color}>
          <BarChart data={charts[1].data} color={charts[1].color} />
        </Section>
      </div>

      {/* Controls + Station health */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Section title="System Controls" icon="tune" color={color}>
          <div className="flex flex-col">
            {controls.map((c) => (
              <Toggle key={c} label={c} value={toggles[c]} onChange={(v) => setToggles((p) => ({ ...p, [c]: v }))} />
            ))}
          </div>
        </Section>
        <Section title="Station Health" icon="fact_check" color={color}>
          <div className="flex flex-col gap-2">
            {[
              { name: 'Nagpur Station #1',   status: id === 'thermal' ? 'warning' : 'online', val: id === 'thermal' ? '84.2°C' : 'Nominal' },
              { name: 'Bengaluru Station #1', status: id === 'thermal' ? 'online' : 'warning',  val: id === 'thermal' ? '41°C' : 'Sag 7%' },
              { name: 'Delhi NCR HUB',       status: 'online', val: 'Nominal' },
              { name: 'Mumbai Gateway',      status: 'online', val: 'Nominal' },
              { name: 'Chennai Central',     status: 'online', val: 'Nominal' },
            ].map((st) => {
              const c = st.status === 'warning' ? '#f5b544' : st.status === 'critical' ? '#ff5c5c' : EV_GREEN
              return (
                <div key={st.name} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c, boxShadow: `0 0 4px ${c}` }} />
                  <span className="flex-1 font-mono text-[11px] truncate text-slate-300">{st.name}</span>
                  <span className="font-mono text-[10px] font-semibold" style={{ color: st.status === 'online' ? STEEL_BLUE : c }}>{st.val}</span>
                </div>
              )
            })}
          </div>
        </Section>
      </div>

      {/* Event log */}
      <Section title="Recent Events" icon="history" color={color}>
        <div className="flex flex-col gap-1.5">
          {[
            { time: '18:42:01', msg: `${title} nominal — all systems operational`, level: 'ok' },
            { time: '17:30:14', msg: 'Auto-optimisation cycle completed', level: 'ok' },
            { time: '14:22:38', msg: id === 'thermal' ? 'Nagpur thermal threshold exceeded — auto-throttle applied' : 'Scheduled health check passed', level: id === 'thermal' ? 'warning' : 'ok' },
            { time: '11:05:59', msg: 'Predictive maintenance window scheduled', level: 'ok' },
            { time: '08:00:00', msg: 'Daily initialisation complete', level: 'ok' },
          ].map((e) => {
            const c = e.level === 'warning' ? '#f5b544' : e.level === 'critical' ? '#ff5c5c' : STEEL_BLUE_DIM
            return (
              <div key={e.time} className="flex gap-3 items-start px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.015)' }}>
                <span className="font-mono text-[9px] shrink-0 mt-0.5 text-slate-600">{e.time}</span>
                <span className="w-1 h-1 rounded-full mt-1.5 shrink-0 bg-slate-500" style={{ background: e.level === 'warning' ? '#f5b544' : 'rgba(255,255,255,0.2)' }} />
                <span className="font-mono text-[11px] text-slate-400">{e.msg}</span>
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
