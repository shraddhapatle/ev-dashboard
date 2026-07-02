import React, { useMemo } from 'react'
import Icon from './Icon'

const STEEL_BLUE = '#cbd5e1'
const STEEL_BLUE_DIM = '#94a3b8'
const EV_GREEN = '#39ff6a'
const WARN = '#f5b544'
const CRIT = '#ff5c5c'

function MiniMetric({ label, value, icon, unit, color = '#cbd5e1' }) {
  return (
    <div className="glass-panel rounded-xl p-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-900 border border-white/5 shrink-0">
        <Icon name={icon} style={{ color: color }} size={16} />
      </div>
      <div>
        <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="block text-[14px] font-mono font-bold text-slate-200 mt-0.5">
          {value}
          {unit && <span className="text-[10px] text-slate-500 ml-0.5">{unit}</span>}
        </span>
      </div>
    </div>
  )
}

export default function StationDetailPage({ station, onBack, onOpenTwin }) {
  // Pull real performance data from the station object (backend) or fall back
  // to stable synthetic values derived from the station id (CSV mode).
  const p = station.performance || {}

  const { hourlyUtil, loadProfile, ports } = useMemo(() => {
    const seedNum = (station.id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)

    // Prefer real 24h series from the backend; generate synthetically as fallback
    const hourlyUtil = p.util_series?.length === 24
      ? p.util_series
      : Array.from({ length: 24 }, (_, i) => {
          const base = 20 + Math.sin((i / 24) * Math.PI * 2) * 15 + (seedNum % 25)
          return Math.min(Math.max(Math.round(base), 5), 95)
        })

    const cap = station.capacity_kw || 50
    const loadProfile = p.power_series?.length === 24
      ? p.power_series
      : Array.from({ length: 24 }, (_, i) => {
          const base = 5 + Math.sin(((i - 6) / 24) * Math.PI * 2) * 8 + (seedNum % 8)
          return Math.max(parseFloat(base.toFixed(1)), 1.2)
        })

    // 4 charger ports
    const portStatuses = ['Free', 'Charging', 'Free', 'Charging']
    if (station.status === 'critical') {
      portStatuses[1] = 'Fault'
      portStatuses[3] = 'Fault'
    } else if (station.status === 'warning') {
      portStatuses[1] = 'Fault'
    }
    const ports = portStatuses.map((status, idx) => ({
      id: `P${idx + 1}`,
      status,
      type: idx % 2 === 0 ? 'CCS-2 (DC)' : 'Type-2 (AC)',
      power: idx % 2 === 0 ? '50 kW' : '22 kW'
    }))

    return { hourlyUtil, loadProfile, ports }
  }, [station])

  const statusColor = station.status === 'critical' ? CRIT : station.status === 'warning' ? WARN : EV_GREEN

  return (
    <div className="flex-1 h-full overflow-y-auto p-6 flex flex-col gap-6" style={{ scrollbarWidth: 'thin' }}>
      {/* Navigation Breadcrumbs & Actions */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2 text-[12px] font-mono text-slate-400">
          <button onClick={onBack} className="hover:text-slate-200 transition-colors flex items-center gap-1">
            <Icon name="arrow_back" size={14} /> Back to Map
          </button>
          <span>/</span>
          <span className="text-slate-200 font-bold">{station.Name}</span>
        </div>

        <button
          onClick={() => onOpenTwin(station)}
          className="cta-button px-4 py-2 rounded-xl flex items-center gap-2 text-[12px] font-mono font-bold text-slate-100"
        >
          <Icon name="3d_rotation" size={16} />
          Launch Digital Twin
        </button>
      </div>

      {/* Header Info Card */}
      <div className="glass-panel rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-900 border border-white/5 shadow-inner">
            <Icon name="ev_station" className="text-slate-300" size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-poppins text-[20px] font-bold text-slate-100">{station.Name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[8.5px] font-mono font-bold uppercase tracking-wider" style={{ background: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}40` }}>
                {station.status}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-1 leading-none">{station.address || 'All-India EV Network Station'}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="text-right">
            <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">Network Latency</span>
            <span className="block text-[13px] font-mono font-bold text-slate-200 mt-0.5">14 ms</span>
          </div>
        </div>
      </div>

      {/* Grid of Key Performance Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MiniMetric label="Current Load"  value={station.current_load_kw ?? p.power_output_kw ?? '—'}   unit="kW"   icon="bolt"          color={EV_GREEN} />
        <MiniMetric label="Utilization"   value={p.util ?? station.util ?? '—'}                          unit="%"    icon="query_stats"   color={STEEL_BLUE} />
        <MiniMetric label="Energy Today"  value={p.energy_today_kwh ?? station.energy_today_kwh ?? '—'}  unit="kWh"  icon="electric_car"  color={STEEL_BLUE} />
        <MiniMetric label="Revenue Yield" value={p.revenue_today_inr ? `₹${p.revenue_today_inr.toLocaleString('en-IN')}` : '—'} icon="payments" color={EV_GREEN} />
        <MiniMetric label="Carbon Saved"  value={p.co2_saved_kg ?? station.co2_saved_kg ?? '—'}          unit="kg"   icon="eco"           color={EV_GREEN} />
        <MiniMetric label="AI Risk Score" value={station.sensors?.ai_risk_score ?? '—'}                  unit="/100" icon="psychology"     color={statusColor} />
      </div>

      {/* Main Analysis Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Ports Grid & Telemetry */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Charger Ports Availability */}
          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3">
            <span className="font-mono text-[9.5px] font-bold tracking-widest text-slate-500 uppercase">Port Status</span>
            <div className="grid grid-cols-2 gap-3">
              {ports.map((p) => {
                const pc = p.status === 'Charging' ? EV_GREEN : p.status === 'Fault' ? CRIT : '#64748b'
                return (
                  <div key={p.id} className="inner-carve p-3 rounded-xl flex flex-col justify-between h-[80px]" style={{ background: 'rgba(8,10,12,0.3)' }}>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] font-bold text-slate-400">{p.id}</span>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: pc, boxShadow: `0 0 4px ${pc}` }} />
                    </div>
                    <div>
                      <span className="block text-[8.5px] font-mono text-slate-500 leading-none">{p.type}</span>
                      <span className="block text-[11px] font-mono font-bold text-slate-200 mt-1 leading-none">{p.status}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Telemetry Sensors */}
          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3">
            <span className="font-mono text-[9.5px] font-bold tracking-widest text-slate-500 uppercase">Hardware Telemetry</span>
            <div className="flex flex-col gap-2.5">
              {[
                { name: 'Rectifier Temp',   val: station.sensors?.rectifier_temp_c  ?? '—', unit: '°C',  cond: (station.sensors?.rectifier_temp_c ?? 0) > 80 ? CRIT : STEEL_BLUE_DIM },
                { name: 'Coolant Pressure', val: station.sensors?.coolant_pressure_psi ?? '—', unit: 'psi', cond: (station.sensors?.coolant_pressure_psi ?? 30) < 22 ? WARN : STEEL_BLUE_DIM },
                { name: 'Voltage Sag',      val: station.sensors?.voltage_sag_percent ?? '—', unit: '%',  cond: (station.sensors?.voltage_sag_percent ?? 0) > 9 ? WARN : STEEL_BLUE_DIM },
                { name: 'Fan Vibration',    val: station.sensors?.fan_vibration_hz   ?? '—', unit: 'Hz', cond: (station.sensors?.fan_vibration_hz ?? 0) > 35 ? WARN : STEEL_BLUE_DIM },
              ].map((t) => (
                <div key={t.name} className="flex justify-between items-center pb-2 border-b border-white/5 last:border-0 last:pb-0">
                  <span className="text-[11px] font-mono text-slate-400">{t.name}</span>
                  <span className="text-[11.5px] font-mono font-bold" style={{ color: t.cond }}>
                    {t.val} <span className="text-[9px] text-slate-600 font-normal">{t.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Charts */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Load Profile Chart */}
          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3">
            <span className="font-mono text-[9.5px] font-bold tracking-widest text-slate-500 uppercase">Load Profile & Power Demand (24h)</span>
            <div className="h-[150px] w-full flex items-end gap-1 pt-4 pb-2 px-1 relative">
              <div className="absolute left-0 top-0 text-[8.5px] font-mono text-slate-600">kW</div>
              {loadProfile.map((val, idx) => {
                const maxVal = Math.max(...loadProfile, 1)
                const pct = (val / maxVal) * 100
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-slate-200 text-[8.5px] font-mono px-1.5 py-0.5 rounded border border-white/10 pointer-events-none z-10 whitespace-nowrap">
                      {idx}:00 — {val} kW
                    </div>
                    <div className="w-full rounded-t-sm transition-all hover:brightness-125" style={{ height: `${pct}%`, background: `linear-gradient(180deg, ${EV_GREEN} 0%, rgba(57,255,106,0.1) 100%)` }} />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-[8px] font-mono text-slate-600 px-1 border-t border-white/5 pt-1.5">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:59</span>
            </div>
          </div>

          {/* Hourly Utilization Chart */}
          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3">
            <span className="font-mono text-[9.5px] font-bold tracking-widest text-slate-500 uppercase">Hourly Utilization Rate (%)</span>
            <div className="h-[120px] w-full flex items-end gap-1 pt-4 pb-2 px-1">
              {hourlyUtil.map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-slate-200 text-[8.5px] font-mono px-1.5 py-0.5 rounded border border-white/10 pointer-events-none z-10 whitespace-nowrap">
                    {idx}:00 — {val}%
                  </div>
                  <div className="w-full rounded-t-sm" style={{ height: `${val}%`, background: 'linear-gradient(180deg, #64748b 0%, rgba(100,116,139,0.1) 100%)' }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[8px] font-mono text-slate-600 px-1 border-t border-white/5 pt-1.5">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:59</span>
            </div>
          </div>

          {/* Maintenance History */}
          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3">
            <span className="font-mono text-[9.5px] font-bold tracking-widest text-slate-500 uppercase">Maintenance Logs</span>
            <div className="flex flex-col gap-2">
              {(p.maintenance_history ?? station.maintenanceHistory ?? []).slice(0, 5).map((m, idx) => {
                const sc = m.status === 'Completed' ? EV_GREEN : m.status === 'In Progress' ? WARN : '#a78bfa'
                return (
                  <div key={idx} className="inner-carve p-2.5 rounded-lg flex justify-between items-center text-[10.5px] font-mono" style={{ background: 'rgba(8,10,12,0.2)' }}>
                    <div>
                      <span className="text-slate-500 text-[9.5px]">{m.date}</span>
                      <p className="text-slate-300 mt-0.5 font-sans font-medium">{m.event || m.task}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-[9px] text-slate-400">{m.tech}</span>
                      <span className="text-[9px] font-bold uppercase" style={{ color: sc }}>{m.status}</span>
                    </div>
                  </div>
                )
              })}
              {!(p.maintenance_history ?? station.maintenanceHistory)?.length && (
                <p className="text-center text-slate-600 font-mono text-[10px] py-3">No maintenance records available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
