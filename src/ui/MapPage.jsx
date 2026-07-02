import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Icon from './Icon'
import SubsystemsPanel from './SubsystemsPanel'
import SubsystemDetailPage from './SubsystemDetailPage'
import StationAnalyticsPanel from './StationAnalyticsPanel'
import StationPerformancePanel from './StationPerformancePanel'
import StationDetailPage from './StationDetailPage'
import { loadStations, STATUS_META, v2gSnapshot } from '../data/stations'
import { aiAdvisories } from '../data/twinModel'

const INDIA = [22.6, 80.0]

function FitBounds({ points }) {
  const map = useMap()
  const done = useRef(false)
  useEffect(() => {
    if (done.current || !points.length) return
    done.current = true
    map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 12 })
  }, [points, map])
  return null
}

function PanTo({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.latitude, target.longitude], 14, { duration: 1 })
  }, [target, map])
  return null
}

const pulseIcon = (color) =>
  L.divIcon({
    className: 'map-pulse-wrap',
    html: `<span class="map-pulse" style="--c:${color}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })

function Sparkline({ data, color = '#cbd5e1' }) {
  const w = 220, h = 40
  const max = Math.max(...data), min = Math.min(...data)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 6) - 3}`).join(' ')
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" style={{ filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.4))` }} />
    </svg>
  )
}

function Section({ icon, title, children, right }) {
  return (
    <div className="glass-panel rounded-2xl p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Icon name={icon} className="text-slate-400" size={16} />
          <span className="font-mono text-[9px] tracking-widest text-slate-500 uppercase">{title}</span>
        </div>
        {right}
      </div>
      {children}
    </div>
  )
}

export default function MapPage({ onBack, onOpenTwin, onLogout }) {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(new Set(['online', 'warning', 'critical', 'offline']))
  const [hover, setHover] = useState(null)
  const [popupStation, setPopupStation] = useState(null)
  const [panTarget, setPanTarget] = useState(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef(null)
  const [activePage, setActivePage] = useState('map')

  useEffect(() => {
    loadStations()
      .then(setStations)
      .catch((e) => console.error('station load failed', e))
      .finally(() => setLoading(false))
  }, [])

  const counts = useMemo(() => {
    const c = {}
    for (const s of stations) c[s.status] = (c[s.status] || 0) + 1
    return c
  }, [stations])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return stations.filter(
      (s) => active.has(s.status) && (!q || (s.Name || '').toLowerCase().includes(q) || (s.city || '').toLowerCase().includes(q) || (s.id || '').toLowerCase().includes(q))
    )
  }, [stations, active, query])

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return stations.filter((s) =>
      (s.Name || '').toLowerCase().includes(q) || (s.city || '').toLowerCase().includes(q) || (s.id || '').toLowerCase().includes(q)
    ).slice(0, 8)
  }, [stations, query])

  const { canvasMarkers, pulseMarkers } = useMemo(() => {
    const cm = [], pm = []
    for (const s of visible) (s.status === 'warning' || s.status === 'critical' ? pm : cm).push(s)
    return { canvasMarkers: cm, pulseMarkers: pm }
  }, [visible])

  const v2g = useMemo(() => (stations.length ? v2gSnapshot(stations) : null), [stations])

  const activeStationId = activePage.startsWith('station-') ? activePage.replace('station-', '') : null
  const activeStation = useMemo(() => {
    return stations.find(s => s.id === activeStationId)
  }, [stations, activeStationId])

  const toggle = (k) => setActive((p) => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n })
  const handleMarkerClick = (s) => { setPopupStation(s); setPanTarget(s) }
  const handleStationSelect = (s) => {
    setPopupStation(null)
    setPanTarget(s)
    setActivePage('station-' + s.id)
  }

  return (
    <div className="mesh-bg w-full h-full relative overflow-hidden flex">

      {/* ===== LEFT — Permanent Nav ===== */}
      <SubsystemsPanel
        active={activePage}
        onSelect={(id) => setActivePage(id)}
        onMapClick={() => setActivePage('map')}
        onOpenTwin={onOpenTwin}
        onLogout={onLogout}
      />

      {/* ===== CENTRE — Map, Subsystem or Station Detail Page ===== */}
      <div className="flex-1 h-full relative overflow-hidden flex flex-col">
        {activePage === 'map' ? (
          <div className="relative flex-1 h-full p-4 px-0">
            <div className="relative w-full h-full rounded-2xl overflow-hidden glass-panel">
              <MapContainer center={INDIA} zoom={5} scrollWheelZoom preferCanvas zoomControl={false} className="w-full h-full" style={{ background: '#05080a' }}>
                <TileLayer attribution="&copy; OpenStreetMap &copy; CARTO" url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <FitBounds points={stations.map((s) => [s.latitude, s.longitude])} />
                <PanTo target={panTarget} />

                {canvasMarkers.map((s) => {
                  const m = STATUS_META[s.status]
                  return (
                    <CircleMarker key={s.id} center={[s.latitude, s.longitude]}
                      radius={activeStationId === s.id ? 7 : 4}
                      pathOptions={{ color: m.color, weight: activeStationId === s.id ? 2 : 1, fillColor: m.color, fillOpacity: activeStationId === s.id ? 0.85 : 0.5 }}
                      eventHandlers={{ click: () => handleMarkerClick(s), mouseover: () => setHover(s), mouseout: () => setHover(null) }}
                    />
                  )
                })}

                {pulseMarkers.map((s) => (
                  <Marker key={s.id} position={[s.latitude, s.longitude]} icon={pulseIcon(STATUS_META[s.status].color)}
                    eventHandlers={{ click: () => handleMarkerClick(s), mouseover: () => setHover(s), mouseout: () => setHover(null) }}
                  />
                ))}
              </MapContainer>

              {/* Network Overview — real aggregate data from the loaded station set */}
              {!loading && (
                <div className="pointer-events-none absolute top-4 left-4 z-[1000] glass-panel-heavy rounded-xl px-4 py-2.5 flex items-center gap-4" style={{ position: 'absolute' }}>
                  <div className="flex items-center gap-1.5">
                    <Icon name="ev_station" size={14} style={{ color: '#94a3b8' }} fill={1} />
                    <span className="font-mono text-[9px] tracking-widest uppercase text-slate-500">Network</span>
                    <span className="font-mono text-[13px] font-bold text-slate-100">{stations.length}</span>
                  </div>
                  <div className="w-px h-5 bg-white/10" />
                  {[
                    { key: 'online', label: 'Online' },
                    { key: 'warning', label: 'Warn' },
                    { key: 'critical', label: 'Crit' },
                    { key: 'offline', label: 'Off' },
                  ].map((f) => (
                    <div key={f.key} className="flex items-center gap-1.5">
                      <span className="status-dot" style={{ background: STATUS_META[f.key].color, boxShadow: `0 0 5px ${STATUS_META[f.key].color}` }} />
                      <span className="font-mono text-[10.5px] text-slate-400">{f.label}</span>
                      <span className="font-mono text-[11.5px] font-bold text-slate-200">{counts[f.key] || 0}</span>
                    </div>
                  ))}
                  {v2g && (
                    <>
                      <div className="w-px h-5 bg-white/10" />
                      <div className="flex items-center gap-1.5">
                        <Icon name="ev_shadow" size={14} style={{ color: '#39ff6a' }} fill={1} />
                        <span className="font-mono text-[10.5px] text-slate-400">V2G</span>
                        <span className="font-mono text-[11.5px] font-bold text-slate-200">{v2g.evsDischarging}</span>
                        <span className="font-mono text-[9px] text-slate-500">EVs</span>
                        <span className="font-mono text-[11.5px] font-bold" style={{ color: '#39ff6a' }}>{v2g.mwSaved}</span>
                        <span className="font-mono text-[9px] text-slate-500">MW</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {hover && !popupStation && (
                <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-[1000] glass-panel-heavy rounded-xl px-4 py-2 flex items-center gap-3" style={{ position: 'absolute' }}>
                  <span className="status-dot" style={{ background: STATUS_META[hover.status].color, boxShadow: `0 0 6px ${STATUS_META[hover.status].color}` }} />
                  <span className="font-poppins text-[13px] text-slate-200">{hover.Name}</span>
                  <span className="font-mono text-[10.5px] text-slate-400">{hover.city}</span>
                  <span className="font-mono text-[10.5px]" style={{ color: STATUS_META[hover.status].color }}>RISK {hover.sensors.ai_risk_score}</span>
                  <span className="font-mono text-[9.5px] text-slate-500">click → analytics</span>
                </div>
              )}
            </div>

            {/* Station Analytics Panel overlay */}
            {popupStation && (
              <StationAnalyticsPanel
                station={popupStation}
                onClose={() => setPopupStation(null)}
                onOpenTwin={onOpenTwin}
                onOpenDetails={handleStationSelect}
              />
            )}
          </div>
        ) : activePage.startsWith('station-') && activeStation ? (
          <StationDetailPage
            station={activeStation}
            onBack={() => setActivePage('map')}
            onOpenTwin={onOpenTwin}
          />
        ) : (
          <SubsystemDetailPage id={activePage} />
        )}
      </div>

      {/* ===== GLOBAL RIGHT — Collapsible Station Navigator Panel ===== */}
      <StationPerformancePanel
        stations={stations}
        query={query}
        setQuery={setQuery}
        activeFilters={active}
        setActiveFilters={setActive}
        onSelectStation={handleStationSelect}
        activeStationId={activeStationId}
      />
    </div>
  )
}
