import React, { useState } from 'react'
import Icon from './Icon'
import { authenticate } from '../auth'

const EV_GREEN = '#39ff6a'

const DEMO_CREDS = [
  { label: 'Admin · full access', user: 'admin', pass: 'admin123' },
  { label: 'App User · view only', user: 'appuser', pass: 'appuser123' },
  { label: 'Field Alerts · mobile', user: 'fieldalert', pass: 'field123' },
]

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showCreds, setShowCreds] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const role = authenticate(username, password)
    if (!role) {
      setError('Invalid username or password')
      return
    }
    setError('')
    onLogin(role)
  }

  return (
    <div className="mesh-bg w-full h-full relative overflow-hidden flex items-center justify-center">
      {/* Ambient glow blobs */}
      <div className="login-glow" style={{ top: '15%', left: '20%' }} />
      <div className="login-glow" style={{ bottom: '10%', right: '15%', animationDelay: '1.4s' }} />

      <form onSubmit={handleSubmit} className="glass-panel-heavy wall-glow relative z-10 w-[400px] rounded-2xl p-8 flex flex-col gap-5 fade-in">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-2">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              borderBottom: '1px solid rgba(0,0,0,0.6)',
              boxShadow: `0 4px 16px rgba(0,0,0,0.4), 0 0 24px rgba(57,255,106,0.12)`,
            }}>
            <Icon name="hub" size={28} style={{ color: '#e2e8f0' }} fill={1} />
          </div>
          <div className="text-center">
            <div className="font-mono text-[10px] tracking-[0.25em] text-slate-500 uppercase">Sajag</div>
            <div className="font-poppins text-[20px] font-bold leading-tight text-slate-100 glow-text-primary">Tactical Command</div>
          </div>
        </div>

        {/* Username */}
        <div className="inner-carve flex items-center px-3.5 py-3 gap-2.5" style={{ background: 'rgba(8,10,12,0.4)' }}>
          <Icon name="person" className="text-slate-500" size={17} />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            className="bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 w-full text-[13px] font-mono"
          />
        </div>

        {/* Password */}
        <div className="inner-carve flex items-center px-3.5 py-3 gap-2.5" style={{ background: 'rgba(8,10,12,0.4)' }}>
          <Icon name="lock" className="text-slate-500" size={17} />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            className="bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 w-full text-[13px] font-mono"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,92,92,0.08)', border: '1px solid rgba(255,92,92,0.25)' }}>
            <Icon name="error" size={14} style={{ color: '#ff5c5c' }} fill={1} />
            <span className="font-mono text-[10.5px] text-[#ff9d9d]">{error}</span>
          </div>
        )}

        <button type="submit" className="cta-button rounded-xl py-3 flex items-center justify-center gap-2 font-mono text-[12px] font-bold tracking-wide uppercase">
          <Icon name="login" size={16} fill={1} />
          Sign In
        </button>

        {/* Demo credentials disclosure */}
        <button
          type="button"
          onClick={() => setShowCreds((v) => !v)}
          className="flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <Icon name={showCreds ? 'expand_less' : 'info'} size={13} />
          <span className="font-mono text-[9.5px] tracking-wide">Demo credentials</span>
        </button>
        {showCreds && (
          <div className="flex flex-col gap-1.5 -mt-2">
            {DEMO_CREDS.map((c) => (
              <div key={c.user} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="font-mono text-[9px] text-slate-500">{c.label}</span>
                <span className="font-mono text-[9.5px] text-slate-300">{c.user} / {c.pass}</span>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  )
}
