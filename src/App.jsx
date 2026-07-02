import React, { useState, useCallback } from 'react'
import DigitalTwin from './twin/DigitalTwin'
import TopBar from './ui/TopBar'
import ComponentTree from './ui/ComponentTree'
import DiagnosticsPanel from './ui/DiagnosticsPanel'
import ControlDock from './ui/ControlDock'
import MapPage from './ui/MapPage'
import LoginPage from './ui/LoginPage'
import AppUserView from './ui/AppUserView'
import AlertsView from './ui/AlertsView'
import { toTwinStation } from './data/stations'
import { loadSession, saveSession, clearSession } from './auth'

export default function App() {
  const [role, setRole] = useState(loadSession)
  const [view, setView] = useState('map') // 'map' (dashboard) | 'twin'
  const [activeStation, setActiveStation] = useState(null) // raw map station
  const [fading, setFading] = useState(false)

  const [explode, setExplode] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)
  const [isolate, setIsolate] = useState(false)
  const [autoRotate, setAutoRotate] = useState(false)

  const handleSelect = useCallback((id) => {
    setSelectedId(id)
    if (id) setExplode((e) => (e < 0.25 ? 0.55 : e))
  }, [])

  const handleReset = useCallback(() => {
    setSelectedId(null)
    setExplode(0)
    setIsolate(false)
  }, [])

  // Step 4 of the wow-flow: casing turns transparent, internals slide apart,
  // the failing component is selected & glows red.
  const handleIsolateAnomaly = useCallback(() => {
    setExplode(1)
    setIsolate(false)
    setSelectedId('rectifier_02')
  }, [])

  // map -> twin with a cinematic fade
  const goTwin = useCallback((station) => {
    setFading(true)
    setTimeout(() => {
      setActiveStation(station)
      setExplode(0)
      setSelectedId(null)
      setIsolate(false)
      setView('twin')
      setTimeout(() => setFading(false), 80)
    }, 300)
  }, [])

  const goMap = useCallback(() => {
    setFading(true)
    setTimeout(() => {
      setView('map')
      setTimeout(() => setFading(false), 80)
    }, 300)
  }, [])

  const twinStation = toTwinStation(activeStation)
  const anomaly = twinStation.status === 'critical' || twinStation.status === 'warning'

  const fadeOverlay = (
    <div
      className="fixed inset-0 z-[3000] bg-black pointer-events-none transition-opacity duration-300"
      style={{ opacity: fading ? 1 : 0 }}
    />
  )

  const handleLogin = useCallback((r) => {
    saveSession(r)
    setRole(r)
  }, [])

  const handleLogout = useCallback(() => {
    clearSession()
    setRole(null)
  }, [])

  if (!role) {
    return <LoginPage onLogin={handleLogin} />
  }

  if (role === 'appuser') {
    return <AppUserView onLogout={handleLogout} />
  }

  if (role === 'mobileuser') {
    return <AlertsView onLogout={handleLogout} />
  }

  if (view === 'map') {
    return (
      <>
        <MapPage onBack={goMap} onOpenTwin={goTwin} onLogout={handleLogout} />
        {fadeOverlay}
      </>
    )
  }

  return (
    <div className="mesh-bg w-full h-full relative overflow-hidden">
      {/* 3D layer */}
      <div className="absolute inset-0 fade-in">
        <DigitalTwin
          explode={explode}
          selectedId={selectedId}
          hoveredId={hoveredId}
          isolate={isolate}
          anomaly={anomaly}
          autoRotate={autoRotate}
          onSelect={handleSelect}
          onHover={setHoveredId}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.7)]" />

      {/* UI overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col p-4 gap-4">
        <TopBar station={twinStation} onOpenMap={goMap} onLogout={handleLogout} />
        <div className="flex-1 flex justify-between gap-4 min-h-0">
          <ComponentTree
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={handleSelect}
            onHover={setHoveredId}
          />
          <div className="flex-1" />
          <DiagnosticsPanel station={twinStation} selectedId={selectedId} onSelect={handleSelect} />
        </div>
        <div className="flex justify-center">
          <ControlDock
            explode={explode}
            setExplode={setExplode}
            isolate={isolate}
            setIsolate={setIsolate}
            autoRotate={autoRotate}
            setAutoRotate={setAutoRotate}
            selectedId={selectedId}
            onReset={handleReset}
            onIsolateAnomaly={handleIsolateAnomaly}
          />
        </div>
      </div>
      {fadeOverlay}
    </div>
  )
}
