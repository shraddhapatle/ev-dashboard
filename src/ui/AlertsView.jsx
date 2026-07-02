import React, { useEffect, useMemo, useState } from 'react'
import Icon from './Icon'
import { loadStations, highestRisk, STATUS_META } from '../data/stations'

const WARN = '#f5b544'
const CRIT = '#ff5c5c'

function alertReasons(s) {
  const sn = s.sensors || {}
  const reasons = []
  if (sn.rectifier_temp_c > 70) reasons.push(`Rectifier temp ${sn.rectifier_temp_c}°C`)
  if (sn.fan_vibration_hz > 35) reasons.push(`Fan vibration ${sn.fan_vibration_hz} Hz`)
  if (sn.voltage_sag_percent > 7) reasons.push(`Voltage sag ${sn.voltage_sag_percent}%`)
  if (sn.coolant_pressure_psi < 22) reasons.push(`Coolant pressure ${sn.coolant_pressure_psi} psi`)
  if (sn.cable_temp_c > 60) reasons.push(`Cable temp ${sn.cable_temp_c}°C`)
  return reasons.length ? reasons : [`AI risk score ${sn.ai_risk_score ?? '—'}/100`]
}

export default function AlertsView({ onLogout }) {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [acked, setAcked] = useState(() => new Set())

  useEffect(() => {
    loadStations().then(setStations).finally(() => setLoading(false))
  }, [])

  const alerts = useMemo(() => highestRisk(stations, 50), [stations])

  const toggleAck = (id) => {
    setAcked((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="mesh-bg w-full h-full overflow-y-auto flex justify-center" style={{ scrollbarWidth: 'thin' }}>
      <div className="w-full max-w-[420px] min-h-full flex flex-col gap-4 p-4">
        {/* Top bar */}
        <div className="glass-panel-heavy rounded-2xl flex items-center justify-between px-4 py-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <Icon name="hub" size={18} style={{ color: '#e2e8f0' }} fill={1} />
            <div>
              <div className="font-mono text-[8px] tracking-widest text-slate-500 uppercase">Sajag</div>
              <div className="font-poppins text-[12.5px] font-semibold text-slate-200 leading-none">Field Alerts</div>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 rounded-full hover:bg-white/5 transition-colors text-slate-400 hover:text-slate-200">
            <Icon name="logout" size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between px-1 shrink-0">
          <span className="font-mono text-[9px] tracking-widest uppercase text-slate-500">{alerts.length} open alert{alerts.length === 1 ? '' : 's'}</span>
          <span className="font-mono text-[9px] tracking-widest uppercase text-slate-500">{acked.size} acknowledged</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {alerts.map((s) => {
            const m = STATUS_META[s.status] || STATUS_META.warning
            const isAck = acked.has(s.id)
            const sevColor = s.status === 'critical' ? CRIT : WARN
            return (
              <div key={s.id} className="glass-panel rounded-2xl p-4 flex flex-col gap-2.5" style={{ opacity: isAck ? 0.55 : 1 }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon name={s.status === 'critical' ? 'error' : 'warning'} size={18} fill={1} style={{ color: sevColor }} />
                    <div className="min-w-0">
                      <div className="font-poppins text-[13.5px] font-semibold text-slate-100 truncate">{s.Name}</div>
                      <div className="font-mono text-[9px] text-slate-500 truncate">{s.city}</div>
                    </div>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded font-mono text-[8.5px] font-bold uppercase"
                    style={{ background: `${sevColor}1a`, color: sevColor, border: `1px solid ${sevColor}40` }}>
                    {m.label}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  {alertReasons(s).map((r) => (
                    <div key={r} className="font-mono text-[10px] text-slate-400 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full shrink-0" style={{ background: sevColor }} />
                      {r}
                    </div>
                  ))}
                </div>

                <button onClick={() => toggleAck(s.id)} className={`ack-button rounded-xl py-2 flex items-center justify-center gap-2 font-mono text-[10.5px] font-bold uppercase ${isAck ? 'ack-button-active' : ''}`}>
                  <Icon name={isAck ? 'check_circle' : 'build'} size={14} fill={isAck ? 1 : 0} />
                  {isAck ? 'Acknowledged' : 'Acknowledge & Fix'}
                </button>
              </div>
            )
          })}

          {!loading && alerts.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6 py-12">
              <Icon name="check_circle" size={36} className="text-slate-600" />
              <p className="font-mono text-[11px] text-slate-500">No active alerts. All stations nominal.</p>
            </div>
          )}

          {loading && <div className="text-center font-mono text-[10.5px] text-slate-500 py-4">Loading network…</div>}
        </div>
      </div>
    </div>
  )
}
