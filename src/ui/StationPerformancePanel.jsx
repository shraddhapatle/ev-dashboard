import React, { useState, useMemo } from 'react'
import Icon from './Icon'

const STEEL_BLUE = '#cbd5e1'
const STEEL_BLUE_DIM = '#94a3b8'
const EV_GREEN = '#39ff6a'
const WARN = '#f5b544'
const CRIT = '#ff5c5c'

export default function StationPerformancePanel({
  stations,
  query,
  setQuery,
  activeFilters,
  setActiveFilters,
  onSelectStation,
  activeStationId
}) {
  const [collapsed, setCollapsed] = useState(false)

  // Filter and group stations using synchronized query and filters
  const groupedStations = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = stations.filter(s => {
      const matchesStatus = activeFilters.has(s.status)
      const matchesQuery = !q ||
        (s.Name || '').toLowerCase().includes(q) ||
        (s.city || '').toLowerCase().includes(q) ||
        (s.id || '').toLowerCase().includes(q)
      return matchesStatus && matchesQuery
    })

    // Group by city
    const groups = {}
    for (const s of filtered) {
      const city = s.city || 'Other Hubs'
      if (!groups[city]) groups[city] = []
      groups[city].push(s)
    }

    // Sort cities so Nagpur & Bengaluru are at the top, followed by alphabetical order
    return Object.entries(groups).sort(([cityA], [cityB]) => {
      const aLower = cityA.toLowerCase()
      const bLower = cityB.toLowerCase()
      if (aLower.includes('nagpur')) return -1
      if (bLower.includes('nagpur')) return 1
      if (aLower.includes('bengaluru') || aLower.includes('bangalore')) return -1
      if (bLower.includes('bengaluru') || bLower.includes('bangalore')) return 1
      return cityA.localeCompare(cityB)
    })
  }, [stations, query, activeFilters])

  // Count helper based on all stations
  const counts = useMemo(() => {
    const c = { all: stations.length, critical: 0, warning: 0, online: 0, offline: 0 }
    for (const s of stations) {
      if (c[s.status] !== undefined) c[s.status]++
    }
    return c
  }, [stations])

  // Determine current active filter tab
  const activeTabKey = useMemo(() => {
    if (activeFilters.size === 4) return 'all'
    if (activeFilters.size === 1) {
      if (activeFilters.has('critical')) return 'critical'
      if (activeFilters.has('warning')) return 'warning'
      if (activeFilters.has('online')) return 'online'
      if (activeFilters.has('offline')) return 'offline'
    }
    return 'custom'
  }, [activeFilters])

  const handleFilterClick = (key) => {
    if (key === 'all') {
      setActiveFilters(new Set(['online', 'warning', 'critical', 'offline']))
    } else {
      setActiveFilters(new Set([key]))
    }
  }

  if (collapsed) {
    return (
      <div className="relative z-[1100] shrink-0 h-full flex flex-col justify-center items-center pointer-events-none" style={{ width: 0 }}>
        <button
          onClick={() => setCollapsed(false)}
          className="absolute right-0 w-8 h-20 rounded-l-2xl flex items-center justify-center pointer-events-auto transition-all"
          style={{
            background: 'linear-gradient(270deg, #1e293b 0%, #0f172a 100%)',
            borderLeft: '1.5px solid rgba(255, 255, 255, 0.12)',
            borderTop: '1.5px solid rgba(255, 255, 255, 0.12)',
            borderBottom: '1.5px solid rgba(0, 0, 0, 0.6)',
            boxShadow: '-4px 0 16px rgba(0,0,0,0.5)',
            cursor: 'pointer'
          }}
          title="Expand Navigation Hub"
        >
          <Icon name="chevron_left" size={20} className="text-slate-300 animate-pulse" />
        </button>
      </div>
    )
  }

  return (
    <aside
      className="relative z-[1100] w-[350px] shrink-0 h-full p-4 flex flex-col gap-3 overflow-hidden transition-all"
      style={{
        background: 'rgba(15,20,25,0.95)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
      }}
    >
      {/* Collapse Trigger edge-button */}
      <button
        onClick={() => setCollapsed(true)}
        className="absolute left-0 top-[45%] w-4 h-16 rounded-r-lg flex items-center justify-center transition-all hover:bg-slate-800 border-t border-r border-b border-white/10"
        style={{
          background: 'rgba(30, 41, 59, 0.9)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.4)',
          transform: 'translateX(-1px)'
        }}
        title="Collapse Navigation Hub"
      >
        <Icon name="chevron_right" size={14} className="text-slate-400" />
      </button>

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5 pl-2 shrink-0">
        <div className="flex items-center gap-2">
          <Icon name="map" className="text-slate-400" size={15} fill={1} />
          <h2 className="font-poppins text-[13px] font-bold tracking-wide text-slate-200">Station Navigator</h2>
        </div>
        <span className="font-mono text-[8px] text-slate-500 uppercase">Hub Access</span>
      </div>

      {/* Search Input */}
      <div className="relative pl-1 shrink-0">
        <div className="inner-carve flex items-center px-3 py-2.5 gap-2" style={{ background: 'rgba(8,10,12,0.4)' }}>
          <Icon name="search" className="text-slate-500" size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter stations, cities..."
            className="bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 w-full text-[11px] font-mono"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-500 hover:text-slate-300">
              <Icon name="close" size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Tabs (Skeuomorphic Segmented Selector) */}
      <div className="grid grid-cols-5 gap-1 pl-1 shrink-0">
        {[
          { key: 'all', label: 'All', col: STEEL_BLUE },
          { key: 'critical', label: 'Crit', col: CRIT },
          { key: 'warning', label: 'Warn', col: WARN },
          { key: 'online', label: 'On', col: EV_GREEN },
          { key: 'offline', label: 'Off', col: '#64748b' }
        ].map((f) => {
          const isSelected = activeTabKey === f.key
          return (
            <button
              key={f.key}
              onClick={() => handleFilterClick(f.key)}
              className="station-row py-1 rounded font-mono text-[9px] font-semibold flex flex-col items-center gap-0.5 transition-all"
              style={{
                background: isSelected ? 'rgba(255, 255, 255, 0.05)' : undefined,
                borderTop: `1px solid ${isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)'}`,
                borderBottom: `1.5px solid ${isSelected ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)'}`,
                color: isSelected ? '#f8fafc' : '#94a3b8',
                boxShadow: isSelected ? 'inset 0 1px 0 rgba(255, 255, 255, 0.05)' : 'none'
              }}
              title={`${counts[f.key] || 0} stations`}
            >
              <span>{f.label}</span>
              <span className="font-bold text-[8px] opacity-70">{counts[f.key] || 0}</span>
            </button>
          )
        })}
      </div>

      {/* Scrollable Grouped Station Navigation List */}
      <div
        className="flex-1 overflow-y-auto pl-1 flex flex-col gap-4 pr-1"
        style={{ scrollbarWidth: 'thin' }}
      >
        {groupedStations.map(([city, list]) => (
          <div key={city} className="flex flex-col gap-1.5">
            {/* City Header */}
            <div className="flex items-center gap-2 px-2 py-0.5 sticky top-0 bg-slate-900/95 backdrop-blur z-10 border-b border-white/5 rounded-t">
              <span className="font-mono text-[9px] font-bold tracking-widest text-slate-400 uppercase">{city}</span>
              <span className="font-mono text-[8px] text-slate-600">({list.length})</span>
            </div>

            {/* Stations in City */}
            <div className="flex flex-col gap-1 pl-1">
              {list.map((s) => {
                const isSelected = activeStationId === s.id
                const sc = s.status === 'critical' ? CRIT : s.status === 'warning' ? WARN : s.status === 'offline' ? '#64748b' : EV_GREEN
                return (
                  <button
                    key={s.id}
                    onClick={() => onSelectStation(s)}
                    className="station-row w-full text-left rounded-xl p-2.5 flex items-center justify-between transition-all"
                    style={{
                      background: isSelected ? 'rgba(255, 255, 255, 0.05)' : undefined,
                      borderTop: `1px solid ${isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255,255,255,0.03)'}`,
                      borderBottom: `1.5px solid ${isSelected ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)'}`,
                      boxShadow: isSelected ? 'inset 0 1px 0 rgba(255, 255, 255, 0.05)' : 'none'
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="status-dot w-1.5 h-1.5 shrink-0" style={{ background: sc, boxShadow: `0 0 4px ${sc}` }} />
                      <div className="min-w-0">
                        <span className="block truncate font-mono text-[10.5px] font-bold text-slate-200 leading-none">{s.Name}</span>
                        {s.address && (
                          <span className="block truncate text-[9px] text-slate-500 mt-1 font-mono">{s.address}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pl-2">
                      <span className="font-mono text-[8.5px] text-slate-500">{s.capacity_kw ? `${s.capacity_kw} kW` : ''}</span>
                      <Icon name="chevron_right" size={12} className="text-slate-600" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {groupedStations.length === 0 && (
          <div className="text-center font-mono text-[10.5px] text-slate-500 py-8">
            No stations matching filters
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-2 pt-2 border-t border-white/5 shrink-0">
        <div className="font-mono text-[8.5px] text-slate-600 text-center">
          Sajag Network Navigator · v2.4.1
        </div>
      </div>
    </aside>
  )
}
