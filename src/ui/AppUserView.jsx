import React, { useEffect, useMemo, useState } from 'react'
import Icon from './Icon'
import { loadStations, STATUS_META } from '../data/stations'

const EV_GREEN = '#39ff6a'
const FAV_KEY = 'astrikos_favorite_station'

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.online
  return (
    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[9px] font-semibold"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color, boxShadow: `0 0 5px ${m.color}` }} />
      {m.label}
    </span>
  )
}

function StationStatusCard({ station, isFavorite, onToggleFavorite }) {
  const s = station.sensors || {}
  const p = station.performance || {}
  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-poppins text-[15px] font-semibold text-slate-100 truncate">{station.Name}</div>
          <div className="font-mono text-[9.5px] text-slate-500 truncate mt-0.5">{station.city}{station.address ? ` · ${station.address}` : ''}</div>
        </div>
        <button onClick={onToggleFavorite} className="shrink-0 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <Icon name={isFavorite ? 'star' : 'star_outline'} size={20} fill={isFavorite ? 1 : 0} style={{ color: isFavorite ? '#f5b544' : '#64748b' }} />
        </button>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <StatusBadge status={station.status} />
        <span className="font-mono text-[9px] text-slate-500">{station.capacity_kw ?? 50} kW</span>
        <span className="font-mono text-[9px] text-slate-500">ID: {station.id}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Utilization', value: p.util ?? '—', unit: '%' },
          { label: 'Power Output', value: p.power_output_kw ?? '—', unit: 'kW' },
          { label: 'Ports Free', value: `${p.ports_available ?? 0}/${p.total_ports ?? 4}`, unit: '' },
          { label: 'AI Risk', value: s.ai_risk_score ?? '—', unit: '/100' },
        ].map((k) => (
          <div key={k.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="font-mono text-[8.5px] tracking-widest uppercase text-slate-500">{k.label}</div>
            <div className="font-mono text-[16px] font-bold text-slate-100 mt-0.5">{k.value}<span className="text-[10px] ml-0.5 font-normal text-slate-500">{k.unit}</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AppUserView({ onLogout }) {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [favoriteId, setFavoriteId] = useState(() => localStorage.getItem(FAV_KEY))

  useEffect(() => {
    loadStations().then(setStations).finally(() => setLoading(false))
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return stations.filter((s) =>
      (s.Name || '').toLowerCase().includes(q) || (s.city || '').toLowerCase().includes(q)
    ).slice(0, 10)
  }, [stations, query])

  const selected = useMemo(() => stations.find((s) => s.id === selectedId) || null, [stations, selectedId])
  const favorite = useMemo(() => stations.find((s) => s.id === favoriteId) || null, [stations, favoriteId])

  const toggleFavorite = (id) => {
    const next = favoriteId === id ? null : id
    setFavoriteId(next)
    if (next) localStorage.setItem(FAV_KEY, next)
    else localStorage.removeItem(FAV_KEY)
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
              <div className="font-poppins text-[12.5px] font-semibold text-slate-200 leading-none">Station Lookup</div>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 rounded-full hover:bg-white/5 transition-colors text-slate-400 hover:text-slate-200">
            <Icon name="logout" size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="inner-carve flex items-center px-3.5 py-3 gap-2.5 shrink-0" style={{ background: 'rgba(8,10,12,0.4)' }}>
          <Icon name="search" className="text-slate-500" size={17} />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedId(null) }}
            placeholder="Search station or city..."
            className="bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 w-full text-[13px] font-mono"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-500 hover:text-slate-300">
              <Icon name="close" size={15} />
            </button>
          )}
        </div>

        {/* Search results */}
        {query && (
          <div className="flex flex-col gap-1.5 shrink-0">
            {results.map((s) => {
              const m = STATUS_META[s.status] || STATUS_META.online
              return (
                <button key={s.id} onClick={() => { setSelectedId(s.id); setQuery('') }}
                  className="station-row w-full text-left rounded-xl p-3 flex items-center gap-3">
                  <span className="status-dot" style={{ background: m.color, boxShadow: `0 0 5px ${m.color}` }} />
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] font-bold text-slate-200 truncate">{s.Name}</div>
                    <div className="font-mono text-[9px] text-slate-500 truncate">{s.city}</div>
                  </div>
                </button>
              )
            })}
            {results.length === 0 && (
              <div className="text-center font-mono text-[10.5px] text-slate-500 py-4">No stations found</div>
            )}
          </div>
        )}

        {/* Favorite (quick access) */}
        {!selected && favorite && (
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-1">
              <Icon name="star" size={13} fill={1} style={{ color: '#f5b544' }} />
              <span className="font-mono text-[9px] tracking-widest uppercase text-slate-500">Favorite</span>
            </div>
            <StationStatusCard station={favorite} isFavorite onToggleFavorite={() => toggleFavorite(favorite.id)} />
          </div>
        )}

        {/* Selected station detail */}
        {selected && (
          <div className="flex flex-col gap-2">
            <button onClick={() => setSelectedId(null)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors self-start">
              <Icon name="arrow_back" size={13} />
              <span className="font-mono text-[9.5px]">Back</span>
            </button>
            <StationStatusCard station={selected} isFavorite={favoriteId === selected.id} onToggleFavorite={() => toggleFavorite(selected.id)} />
          </div>
        )}

        {!selected && !favorite && !query && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
            <Icon name="ev_station" size={36} className="text-slate-600" />
            <p className="font-mono text-[11px] text-slate-500">Search for a station above to view its live status. Star a station to pin it here.</p>
          </div>
        )}

        {loading && <div className="text-center font-mono text-[10.5px] text-slate-500 py-4">Loading network…</div>}
      </div>
    </div>
  )
}
