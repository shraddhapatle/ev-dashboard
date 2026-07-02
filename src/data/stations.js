// ============================================================================
// EESL station network loader (all-India)
// ----------------------------------------------------------------------------
// Parses public/all_india_eesl_station.csv (2.6k+ stations across India) and
// augments each with a deterministic synthetic "sensor matrix" so the macro
// map, AI advisory feed and the per-station Digital Twin all read live state.
// Sensor model: Thermocouple/RTD (temps), Hall-effect (voltage sag),
// accelerometer (fan vibration), coolant flow-meter (coolant pressure).
// ============================================================================

import { station as defaultTwinStation } from './twinModel'

const CSV_URL = '/all_india_eesl_station.csv'

export const STATUS_META = {
  online:   { label: 'Online',   color: '#39ff6a', twin: 'ok' },
  warning:  { label: 'Warning',  color: '#f5b544', twin: 'warning' },
  critical: { label: 'Critical', color: '#ff5c5c', twin: 'critical' },
  offline:  { label: 'Offline',  color: '#4a6050', twin: 'warning' },
}

export function parseCSV(csvText) {
  const clean = csvText.replace(/^﻿/, '')
  const lines = clean.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim())
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    const values = []
    let cur = ''
    let inside = false
    for (let j = 0; j < line.length; j++) {
      const ch = line[j]
      const nx = line[j + 1]
      if (ch === '"') {
        if (inside && nx === '"') {
          cur += '"'
          j++
        } else inside = !inside
      } else if (ch === ',' && !inside) {
        values.push(cur.trim())
        cur = ''
      } else cur += ch
    }
    values.push(cur.trim())
    const o = {}
    headers.forEach((h, idx) => {
      let v = values[idx] ?? ''
      if (h === 'latitude' || h === 'longitude') v = parseFloat(v)
      o[h] = v
    })
    rows.push(o)
  }
  return rows
}

// seeded RNG (mulberry32) from a string → stable per-station values
function seed(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  let a = h >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// All random stations are online or offline only.
// The ONLY critical/warning stations are the two pinned city overrides below.
const STATUS_BUCKET = [
  ...Array(95).fill('online'),
  ...Array(5).fill('offline'),
]

function rng(r, lo, hi) {
  return Math.round((lo + r() * (hi - lo)) * 10) / 10
}

function buildSensors(uid, status) {
  const r = seed(uid + status)
  const band = {
    online: { rect: [44, 60], fan: [8, 15], sag: [0, 3], cool: [28, 34], cable: [30, 42], risk: [5, 30] },
    warning: { rect: [66, 79], fan: [34, 45], sag: [5, 9], cool: [20, 26], cable: [50, 62], risk: [60, 84] },
    critical: { rect: [80, 92], fan: [45, 58], sag: [10, 15], cool: [12, 19], cable: [66, 78], risk: [85, 100] },
    offline: { rect: [26, 34], fan: [0, 2], sag: [0, 1], cool: [0, 2], cable: [24, 32], risk: [70, 92] },
  }[status]
  return {
    rectifier_temp_c: rng(r, band.rect[0], band.rect[1]),
    fan_vibration_hz: rng(r, band.fan[0], band.fan[1]),
    voltage_sag_percent: rng(r, band.sag[0], band.sag[1]),
    coolant_pressure_psi: rng(r, band.cool[0], band.cool[1]),
    cable_temp_c: rng(r, band.cable[0], band.cable[1]),
    ai_risk_score: Math.round(rng(r, band.risk[0], band.risk[1])),
  }
}

export function statusFor(uid) {
  const r = seed(uid || 'x')
  return STATUS_BUCKET[Math.floor(r() * 100) % 100] || 'online'
}

const MAINT_EVENTS = ['Routine Inspection', 'Cable Replacement', 'Firmware Update', 'Filter Clean', 'Connector Service', 'Thermal Paste', 'Board Swap']
const MAINT_STATUS = ['Completed', 'Completed', 'Completed', 'In Progress', 'Scheduled']
const TECHS = ['T-101', 'T-204', 'T-308', 'T-412', 'T-517']

function buildPerformance(uid, status, cap) {
  const r = seed(uid + 'perf')
  const capKw = cap || 50
  const util = status === 'offline' ? 0
    : status === 'critical' ? Math.round(15 + r() * 30)
    : status === 'warning'  ? Math.round(45 + r() * 25)
    : Math.round(58 + r() * 35)
  const power_output_kw      = Math.round(capKw * util / 100 * 10) / 10
  const energy_today_kwh     = Math.round(power_output_kw * (7 + r() * 5) * 10) / 10
  const revenue_today_inr    = Math.round(energy_today_kwh * 12.5)  // ₹12.5 / kWh avg EESL rate
  const total_ports          = Math.max(2, Math.round(2 + r() * 4))
  const ports_available      = status === 'offline' ? 0 : Math.max(0, Math.round(total_ports * (1 - util / 100)))
  const sessions_today       = Math.round(util / 10 + r() * 8)
  const avg_session_min      = Math.round(28 + r() * 20)
  const co2_saved_kg         = Math.round(energy_today_kwh * 0.82 * 10) / 10
  // 24-point hourly series
  const util_series = Array.from({ length: 24 }, (_, h) => {
    const peak = (h >= 8 && h <= 10) || (h >= 17 && h <= 20)
    const base = peak ? Math.min(100, util + 20) : (h < 6 ? Math.max(0, util - 40) : util)
    return Math.max(0, Math.min(100, Math.round(base + (r() - 0.5) * 18)))
  })
  const power_series  = util_series.map((u) => Math.round(capKw * u / 100 * 10) / 10)
  const energy_series = util_series.map((u) => Math.round(capKw * u / 100 * 0.92 * 10) / 10)
  // Maintenance log
  const n = 3 + Math.floor(r() * 3)
  const maintenance_history = Array.from({ length: n }, (_, i) => {
    const mo = String(Math.max(1, 6 - i)).padStart(2, '0')
    const day = String(Math.floor(1 + r() * 27)).padStart(2, '0')
    return {
      date: `2026-${mo}-${day}`,
      event: MAINT_EVENTS[Math.floor(r() * MAINT_EVENTS.length)],
      status: i === 0 && r() > 0.7 ? 'Scheduled' : i === 0 && r() > 0.4 ? 'In Progress' : 'Completed',
      tech: TECHS[Math.floor(r() * TECHS.length)],
    }
  })
  return { util, power_output_kw, energy_today_kwh, revenue_today_inr, total_ports, ports_available,
    sessions_today, avg_session_min, co2_saved_kg, util_series, power_series, energy_series, maintenance_history }
}

function num(v) {
  const n = parseFloat(String(v).replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : null
}

// spread markers sharing identical coords so each is individually clickable
function dejitter(stations) {
  const groups = new Map()
  for (const s of stations) {
    const key = `${s.latitude.toFixed(4)},${s.longitude.toFixed(4)}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(s)
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue
    group.forEach((s, i) => {
      const a = i * 2.399963
      const rad = 0.0009 * (1 + i * 0.18)
      s.latitude += rad * Math.sin(a)
      s.longitude += rad * Math.cos(a)
    })
  }
  return stations
}

// ── Internal: augment one raw CSV row into a full station object ──────────
function csvRowToStation(r, i) {
  const uid = r.uid || `EESL-${i}`
  const status = statusFor(uid)
  const cap = num(r.capacity)
  return {
    ...r,
    id: uid,
    Name: r.name || r.Name || r.vendor_name || 'EESL Station',
    status,
    capacity_kw: cap,
    sensors: buildSensors(uid, status),
    performance: buildPerformance(uid, status, cap),
  }
}

// ── Internal: load & process the all-India CSV ────────────────────────────
async function loadFromCSV() {
  const res = await fetch(CSV_URL)
  if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`)
  const rows = parseCSV(await res.text())
  const stations = rows
    .filter(
      (r) =>
        Number.isFinite(r.latitude) &&
        Number.isFinite(r.longitude) &&
        r.latitude !== 0 &&
        r.longitude !== 0 &&
        r.latitude > 6 &&
        r.latitude < 37
    )
    .map(csvRowToStation)
  return dejitter(stations)
}

// ── Internal: apply CSV city-pins when backend is unavailable ─────────────
function applyCsvCityPins(stations) {
  const NAGPUR     = ['nagpur']
  const BENGALURU  = ['bengaluru', 'bangalore', 'bengalore']
  const isCity = (s, kws) =>
    kws.some((k) =>
      (s.city || '').toLowerCase().includes(k) ||
      (s.Name || '').toLowerCase().includes(k) ||
      (s.address || '').toLowerCase().includes(k)
    )
  let nPinned = false, bPinned = false
  for (const s of stations) {
    if (!nPinned && isCity(s, NAGPUR)) {
      s.status = 'critical'
      s.sensors = buildSensors(s.id + '_pinned_critical', 'critical')
      nPinned = true
    } else if (!bPinned && isCity(s, BENGALURU)) {
      s.status = 'warning'
      s.sensors = buildSensors(s.id + '_pinned_warning', 'warning')
      bPinned = true
    }
    if (nPinned && bPinned) break
  }
}

// ── Public: load stations ─────────────────────────────────────────────────
// CSV-only (all-India map coverage), with synthetic city-pin alerts applied.
export async function loadStations() {
  const stations = await loadFromCSV()
  applyCsvCityPins(stations)
  return stations
}

// ---- derived intelligence ---------------------------------------------------

// Top-N highest-risk stations (drives "ghost" maintenance routing).
export function highestRisk(stations, n = 3) {
  return [...stations]
    .filter((s) => s.status === 'critical' || s.status === 'warning')
    .sort((a, b) => b.sensors.ai_risk_score - a.sensors.ai_risk_score)
    .slice(0, n)
}

// Greedy nearest-neighbour route for the maintenance van.
export function maintenanceRoute(stations) {
  const stops = highestRisk(stations, 3)
  if (!stops.length) return null
  // van starts near the centroid of the critical cluster
  const van = {
    lat: stops.reduce((s, x) => s + x.latitude, 0) / stops.length + 0.06,
    lng: stops.reduce((s, x) => s + x.longitude, 0) / stops.length - 0.06,
  }
  const remaining = [...stops]
  const ordered = []
  let cur = [van.lat, van.lng]
  while (remaining.length) {
    let bi = 0
    let bd = Infinity
    remaining.forEach((s, i) => {
      const d = (s.latitude - cur[0]) ** 2 + (s.longitude - cur[1]) ** 2
      if (d < bd) {
        bd = d
        bi = i
      }
    })
    const next = remaining.splice(bi, 1)[0]
    ordered.push(next)
    cur = [next.latitude, next.longitude]
  }
  return {
    van,
    stops: ordered,
    path: [[van.lat, van.lng], ...ordered.map((s) => [s.latitude, s.longitude])],
  }
}

// Vehicle-to-Grid potential (synthetic, stabilises strained clusters).
export function v2gSnapshot(stations) {
  const strained = stations.filter((s) => s.status === 'critical' || s.status === 'warning').length
  const evsDischarging = Math.round(strained * 1.8 + 40)
  const mwSaved = Math.round((evsDischarging * 11) / 100) / 10 // ~11 kW each → MW
  // 16-point synthetic series
  const r = seed('v2g')
  const series = Array.from({ length: 16 }, (_, i) => 0.5 + Math.sin(i / 2) * 0.25 + r() * 0.2)
  return { evsDischarging, mwSaved, series, strained }
}

// ---- adapter: map-station -> twin station shape ----------------------------
export function toTwinStation(s) {
  if (!s) return defaultTwinStation
  const meta = STATUS_META[s.status] || STATUS_META.online
  const cap = s.capacity_kw || defaultTwinStation.peak_capacity_kw
  const load = s.status === 'offline' ? 0 : Math.round(cap * (0.55 + (s.sensors?.ai_risk_score || 30) / 400) * 10) / 10
  return {
    ...defaultTwinStation,
    name: (s.Name || 'EESL Station').toUpperCase(),
    station_id: s.id,
    vendor: s.vendor_name || 'EESL',
    location: [s.address, s.city].filter(Boolean).join(' · ') || defaultTwinStation.location,
    status: meta.twin,
    rawStatus: s.status,
    peak_capacity_kw: cap,
    current_load_kw: Math.min(cap, load),
    total_ports: Number(s.total) || defaultTwinStation.total_ports,
    sensors: s.sensors,
    kernel: defaultTwinStation.kernel,
  }
}
