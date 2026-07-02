import React from 'react'
import Icon from './Icon'
import { station as defaultStation, getPart, aiAdvisories, STATUS } from '../data/twinModel'

const G = '#39ff6a'
const STEEL_BLUE = '#94a3b8'

function Bar({ value, max, state }) {
  const pct = Math.max(2, Math.min(100, (value / (max || 100)) * 100))
  const color = STATUS[state]?.color || STEEL_BLUE
  return (
    <div className="w-full h-1.5 rounded-full inner-carve overflow-hidden mt-1.5">
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}88` }}
      />
    </div>
  )
}

function TelemetryRow({ t }) {
  const color = STATUS[t.state]?.color || '#cbd5e1'
  return (
    <div className="inner-carve px-3 py-2.5" style={{ background: 'rgba(8,10,12,0.4)' }}>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[9px] tracking-wider text-slate-500 uppercase">
          {t.label}
        </span>
        <span className="font-mono text-[14px] font-semibold" style={{ color }}>
          {t.value}
          {t.unit ? <span className="text-[10px] text-slate-500 ml-0.5">{t.unit}</span> : null}
        </span>
      </div>
      {typeof t.value === 'number' && t.max ? <Bar value={t.value} max={t.max} state={t.state} /> : null}
      {t.sensor ? (
        <div className="font-mono text-[8px] tracking-wider text-slate-600 uppercase mt-1.5 flex items-center gap-1">
          <Icon name="sensors" size={10} /> {t.sensor}
        </div>
      ) : null}
    </div>
  )
}

function AlertCard({ alert, onAction }) {
  const crit = alert.level === 'critical'
  const tone = crit ? '#ff5c5c' : '#f5b544'
  return (
    <div
      className="rounded-xl p-3.5 fade-in"
      style={{
        background: crit ? 'rgba(70,8,8,0.25)' : 'rgba(60,42,8,0.2)',
        border: `1px solid ${tone}44`,
        boxShadow: `0 4px 12px rgba(0,0,0,0.3)`,
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Icon name={crit ? 'gpp_maybe' : 'warning'} fill={1} size={16} style={{ color: tone }} />
        <span className="font-poppins text-[13px] font-semibold" style={{ color: tone }}>
          {alert.title}
        </span>
      </div>
      <div className="font-mono text-[9px] tracking-wider text-slate-500 mb-2">
        ANOMALY ID: {alert.code}
      </div>
      <p className="text-[12px] text-slate-300 leading-relaxed mb-2.5">{alert.message}</p>
      {alert.auto_action && (
        <div className="rounded-lg px-2.5 py-2 mb-3 flex items-start gap-1.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Icon name="auto_mode" size={13} className="text-slate-400 mt-0.5 shrink-0" />
          <span className="text-[10.5px] text-slate-300 leading-snug">
            <span className="font-mono text-[8px] tracking-wider uppercase text-slate-500">Automated Action · </span>
            {alert.auto_action}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="inner-carve px-2.5 py-1">
          <span className="font-mono text-[9px] tracking-wider text-slate-500">DISPATCH ETF </span>
          <span className="font-mono text-[11px] font-bold" style={{ color: tone }}>
            {alert.etf_hrs} Hrs
          </span>
        </div>
        <button
          onClick={onAction}
          className="px-2.5 py-1 rounded-lg font-mono text-[10px] tracking-wider uppercase font-semibold transition-all hover:brightness-110"
          style={{ background: `${tone}18`, border: `1px solid ${tone}66`, color: tone }}
        >
          {alert.action} →
        </button>
      </div>
    </div>
  )
}

function PartView({ part, onAction }) {
  const st = STATUS[part.status]
  return (
    <div className="flex flex-col gap-3 fade-in">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h3 className="font-poppins text-[16px] font-semibold text-slate-200 leading-tight truncate">
            {part.name}
          </h3>
          <span className="font-mono text-[9px] tracking-wider text-slate-500">
            {part.id}
          </span>
        </div>
        <span
          className="px-2 py-0.5 rounded-full font-mono text-[9px] tracking-widest uppercase font-semibold flex items-center gap-1 shrink-0"
          style={{ color: st.color, border: `1px solid ${st.color}44`, background: `${st.color}0a` }}
        >
          <span className={`status-dot ${st.dot}`} />
          {st.label}
        </span>
      </div>

      {part.alert && <AlertCard alert={part.alert} onAction={onAction} />}

      <div className="font-mono text-[9px] tracking-widest text-slate-500 uppercase mt-1">
        Live Telemetry
      </div>
      <div className="grid grid-cols-2 gap-2">
        {part.telemetry?.map((t) => (
          <TelemetryRow key={t.key} t={t} />
        ))}
      </div>
    </div>
  )
}

function SensorTile({ label, value, unit, sensor, state }) {
  const color = STATUS[state]?.color || '#cbd5e1'
  return (
    <div className="inner-carve px-2 py-1.5 flex flex-col justify-between" style={{ background: 'rgba(8,10,12,0.4)' }}>
      <div>
        <div className="font-mono text-[8px] tracking-wider text-slate-500 uppercase truncate">{label}</div>
        <div className="font-mono text-[13px] font-bold" style={{ color }}>
          {value}
          {unit ? <span className="text-[9px] text-slate-500 ml-0.5 font-normal">{unit}</span> : null}
        </div>
      </div>
      {sensor ? <div className="font-mono text-[7px] tracking-wider text-slate-600 uppercase mt-1">{sensor}</div> : null}
    </div>
  )
}

function StationOverview({ station, onSelect }) {
  const st = STATUS[station.status] || STATUS.ok
  const loadPct = (station.current_load_kw / station.peak_capacity_kw) * 100
  const sx = station.sensors
  const sBand = (v, w, c) => (v >= c ? 'critical' : v >= w ? 'warning' : 'ok')
  return (
    <div className="flex flex-col gap-3 fade-in">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h3 className="font-poppins text-[16px] font-semibold text-slate-200 leading-tight truncate">
            {station.name}
          </h3>
          <span className="font-mono text-[9px] tracking-wider text-slate-500 truncate block">
            {station.station_id} · {station.vendor}
          </span>
        </div>
        <span
          className="shrink-0 px-2 py-0.5 rounded-full font-mono text-[9px] tracking-widest uppercase font-semibold flex items-center gap-1"
          style={{ color: st.color, border: `1px solid ${st.color}44`, background: `${st.color}0a` }}
        >
          <span className={`status-dot ${st.dot}`} />
          {st.label}
        </span>
      </div>

      {/* load gauge */}
      <div className="inner-carve px-3 py-3" style={{ background: 'rgba(8,10,12,0.4)' }}>
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[9px] tracking-wider text-slate-500 uppercase">Current Load</span>
          <span className="font-mono text-[16px] font-semibold text-slate-200">
            {station.current_load_kw}
            <span className="text-[10px] text-slate-500 ml-1">/ {station.peak_capacity_kw} kW</span>
          </span>
        </div>
        <Bar value={loadPct} max={100} state="ok" />
        <div className="font-mono text-[9px] text-slate-500 mt-1.5 truncate">{station.location}</div>
      </div>

      {/* sensor matrix */}
      {sx && (
        <>
          <div className="font-mono text-[9px] tracking-widest text-slate-500 uppercase mt-1">Sensor Matrix</div>
          <div className="grid grid-cols-3 gap-1.5">
            <SensorTile label="Rectifier" value={sx.rectifier_temp_c} unit="°C" sensor="RTD" state={sBand(sx.rectifier_temp_c, 66, 80)} />
            <SensorTile label="Fan Vib" value={sx.fan_vibration_hz} unit="Hz" sensor="Accel" state={sBand(sx.fan_vibration_hz, 30, 45)} />
            <SensorTile label="Volt Sag" value={sx.voltage_sag_percent} unit="%" sensor="Hall" state={sBand(sx.voltage_sag_percent, 5, 10)} />
            <SensorTile label="Coolant" value={sx.coolant_pressure_psi} unit="psi" sensor="Flow" state={sx.coolant_pressure_psi < 20 ? 'warning' : 'ok'} />
            <SensorTile label="Cable" value={sx.cable_temp_c} unit="°C" sensor="RTD" state={sBand(sx.cable_temp_c, 50, 66)} />
            <SensorTile label="AI Risk" value={sx.ai_risk_score} unit="" sensor="Model" state={sBand(sx.ai_risk_score, 60, 85)} />
          </div>
        </>
      )}

      <div className="flex items-center justify-between mt-1">
        <span className="font-mono text-[9px] tracking-widest text-slate-500 uppercase">Analysis</span>
        <span className="font-mono text-[8px] tracking-widest text-slate-400 uppercase px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
          ● Live
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {aiAdvisories.map((a) => {
          const tone = a.level === 'critical' ? '#ff5c5c' : '#f5b544'
          return (
            <button
              key={a.id}
              onClick={() => a.partId && onSelect(a.partId)}
              className="text-left rounded-xl p-3 transition-colors hover:bg-slate-800/40"
              style={{ background: 'rgba(15,20,25,0.4)', borderLeft: `3px solid ${tone}` }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-poppins text-[12px] font-medium flex items-center gap-1.5" style={{ color: tone }}>
                  <Icon name={a.icon} fill={1} size={14} />
                  {a.title}
                </span>
                <span className="font-mono text-[8px] text-slate-500">{a.etf}</span>
              </div>
              <p className="text-[11.5px] text-slate-300 leading-snug mb-1.5">{a.advisory}</p>
              <p className="text-[10.5px] text-slate-400 leading-snug flex items-start gap-1">
                <Icon name="auto_mode" size={12} className="mt-0.5 shrink-0" />
                {a.action}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function DiagnosticsPanel({ station = defaultStation, selectedId, onSelect }) {
  const part = selectedId ? getPart(selectedId) : null
  return (
    <aside className="glass-panel pointer-events-auto w-[340px] flex flex-col rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div className="px-4 pt-4 pb-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="monitor_heart" className="text-slate-400" size={18} />
          <h2 className="font-poppins text-[14px] font-semibold text-slate-200">Diagnostics</h2>
        </div>
        {selectedId && (
          <button
            onClick={() => onSelect(null)}
            className="text-slate-500 hover:text-slate-300 flex items-center gap-1 font-mono text-[9px] tracking-wider"
          >
            <Icon name="close" size={14} /> CLEAR
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-260px)]" style={{ scrollbarWidth: 'thin' }}>
        {part ? (
          <PartView part={part} onAction={() => { }} />
        ) : (
          <StationOverview station={station} onSelect={onSelect} />
        )}
      </div>
    </aside>
  )
}
