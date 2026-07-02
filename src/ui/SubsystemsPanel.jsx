import React from 'react'
import Icon from './Icon'

const EV_GREEN = '#39ff6a'
const SLATE_BG = 'linear-gradient(180deg, #182026 0%, #0f1316 100%)'

export const SUBSYSTEMS = [
  { id: 'power',    icon: 'bolt',               label: 'Power Grid',        status: 'ok',      color: EV_GREEN },
  { id: 'thermal',  icon: 'thermostat',          label: 'Thermal Mgmt',     status: 'warning', color: '#f5b544' },
  { id: 'energy',   icon: 'energy_savings_leaf', label: 'Energy Analytics', status: 'ok',      color: EV_GREEN },
]

export default function SubsystemsPanel({ active, onSelect, onMapClick, onOpenTwin, onLogout }) {
  return (
    <aside
      className="relative z-[1100] shrink-0 h-full flex flex-col"
      style={{
        width: 220,
        background: 'rgba(15,20,25,0.95)',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(18px)',
      }}
    >
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-3 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" 
          style={{ 
            background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)', 
            borderTop: '1px solid rgba(255,255,255,0.15)',
            borderBottom: '1px solid rgba(0,0,0,0.6)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
          }}>
          <Icon name="hub" size={18} style={{ color: '#e2e8f0' }} fill={1} />
        </div>
        <div>
          <div className="font-mono text-[9px] tracking-widest uppercase text-slate-400">Infrastructure</div>
          <div className="font-poppins text-[14px] font-semibold leading-tight text-slate-200">Subsystems</div>
        </div>
      </div>

      {/* Map nav */}
      <div className="px-3 pt-4 pb-1">
        <span className="font-mono text-[9px] tracking-widest uppercase px-2 text-slate-500">Navigation</span>
      </div>
      <button
        onClick={onMapClick}
        className="nav-row mx-3 mb-1 flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
        style={{
          background: active === 'map' ? 'rgba(255, 255, 255, 0.06)' : undefined,
          borderTop: active === 'map' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
          borderBottom: active === 'map' ? '1px solid rgba(0, 0, 0, 0.4)' : '1px solid transparent',
          boxShadow: active === 'map' ? 'inset 0 1px 0 rgba(255, 255, 255, 0.05)' : 'none',
        }}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ 
            background: active === 'map' ? 'linear-gradient(135deg, #475569 0%, #1e293b 100%)' : 'rgba(255,255,255,0.03)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            borderBottom: '1px solid rgba(0,0,0,0.4)'
          }}>
          <Icon name="map" size={14} style={{ color: active === 'map' ? '#f8fafc' : '#94a3b8' }} fill={active === 'map' ? 1 : 0} />
        </div>
        <span className="font-mono text-[11px]" style={{ color: active === 'map' ? '#f8fafc' : '#94a3b8' }}>Map View</span>
        {active === 'map' && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: EV_GREEN, boxShadow: `0 0 6px ${EV_GREEN}` }} />}
      </button>

      {onOpenTwin && (
        <button
          onClick={() => onOpenTwin()}
          className="cta-button mx-3 mb-1 flex items-center gap-3 px-3 py-2 rounded-xl"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(57,255,106,0.18) 0%, #1e293b 100%)',
              borderTop: '1px solid rgba(57,255,106,0.3)',
              borderBottom: '1px solid rgba(0,0,0,0.4)'
            }}>
            <Icon name="deployed_code" size={14} fill={1} style={{ color: EV_GREEN }} />
          </div>
          <span className="font-mono text-[11px] text-slate-200">Digital Twin</span>
        </button>
      )}

      {/* Subsystems */}
      <div className="px-3 pt-3 pb-1">
        <span className="font-mono text-[9px] tracking-widest uppercase px-2 text-slate-500">Subsystems</span>
      </div>
      <nav className="flex flex-col gap-1 px-3 flex-1 overflow-y-auto">
        {SUBSYSTEMS.map((sys) => {
          const isActive = active === sys.id
          const dotCol = sys.status === 'warning' ? '#f5b544' : EV_GREEN
          return (
            <button
              key={sys.id}
              onClick={() => onSelect(sys.id)}
              className="nav-row flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left w-full"
              style={{
                background: isActive ? 'rgba(255, 255, 255, 0.05)' : undefined,
                borderTop: isActive ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
                borderBottom: isActive ? '1px solid rgba(0, 0, 0, 0.3)' : '1px solid transparent',
              }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ 
                  background: isActive ? 'linear-gradient(135deg, #475569 0%, #1e293b 100%)' : 'rgba(255,255,255,0.03)',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  borderBottom: '1px solid rgba(0,0,0,0.4)'
                }}>
                <Icon name={sys.icon} size={14} style={{ color: isActive ? '#f8fafc' : '#94a3b8' }} fill={isActive ? 1 : 0} />
              </div>
              <span className="flex-1 font-mono text-[11px] leading-tight" style={{ color: isActive ? '#f8fafc' : '#94a3b8' }}>{sys.label}</span>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotCol, boxShadow: `0 0 5px ${dotCol}`, opacity: isActive ? 1 : 0.45 }} />
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
        <div className="font-mono text-[9px] text-slate-600">Sajag · v2.4.1</div>
        {onLogout && (
          <button onClick={onLogout} title="Log out" className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-slate-500 hover:text-slate-300">
            <Icon name="logout" size={15} />
          </button>
        )}
      </div>
    </aside>
  )
}
