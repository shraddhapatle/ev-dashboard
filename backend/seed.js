// ============================================================================
// seed.js
// ----------------------------------------------------------------------------
// # Advanced data seeder
//
// Populates `sajag_db` with **5 realistic EESL / Delta dual-gun DC fast
// chargers** across the Bengaluru and Nagpur hubs and explicitly models the
// critical "thermal runaway" fault that the dashboard UI is built around.
//
// Run with:  `npm run seed`   (or `node seed.js`)
//
// What it builds per station:
//   - Metadata + map coordinates
//   - Live sensor matrix (thermocouple / accelerometer / Hall-effect / flow)
//   - Performance metrics + 24-point hourly chart series
//   - A full Digital-Twin component tree (SHELL -> CHASSIS -> MODULES) whose
//     telemetry is derived from the station's own live sensors
//   - AI advisory feed + maintenance history
//
// The fault node — **EESL-BLR-001 (BESCOM HQ, Bengaluru)** — is pinned to:
//     status = 'critical', rectifier_temp_c = 84.2, fan_vibration_hz = 42.1,
//     ai_risk_score = 91, and a "Critical Thermal Runaway" advisory.
// ============================================================================

require('dotenv').config();
const mongoose = require('mongoose');
const Station = require('./models/Station');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sajag_db';
const ENERGY_RATE_INR = 12.5; // ₹/kWh — average EESL public DC tariff

// ----------------------------------------------------------------------------
// ## Small numeric helpers
// ----------------------------------------------------------------------------
const round1 = (n) => Math.round(n * 10) / 10;
const rand = (lo, hi) => round1(lo + Math.random() * (hi - lo));
const randInt = (lo, hi) => Math.round(lo + Math.random() * (hi - lo));

// state classification for "higher = worse" metrics
const stateHi = (v, warn, crit) => (v >= crit ? 'critical' : v >= warn ? 'warning' : 'ok');
// state classification for "lower = worse" metrics (e.g. coolant pressure)
const stateLo = (v, warn, crit) => (v <= crit ? 'critical' : v <= warn ? 'warning' : 'ok');

// ----------------------------------------------------------------------------
// ## Performance + 24h time-series generator
// Produces the flat performance fields the schema stores (which the API also
// re-groups into the `performance` virtual for the frontend).
// ----------------------------------------------------------------------------
function buildPerformance(capacity_kw, status, throttleTo = null) {
  const util =
    status === 'offline' ? 0 :
    status === 'critical' ? randInt(18, 34) :   // throttled / unstable
    status === 'warning' ? randInt(48, 68) :
    randInt(62, 92);                            // online

  // Output is capped to the throttle ceiling on a throttled/critical unit.
  const rawOutput = round1((capacity_kw * util) / 100);
  const power_output_kw = throttleTo != null ? Math.min(rawOutput, throttleTo) : rawOutput;
  const current_load_kw = round1(power_output_kw * rand(0.9, 1.0));

  const energy_today_kwh = round1(power_output_kw * rand(7, 12));
  const revenue_today_inr = Math.round(energy_today_kwh * ENERGY_RATE_INR);
  const co2_saved_kg = round1(energy_today_kwh * 0.82); // ~0.82 kg CO2 / kWh grid offset

  const total_ports = 2; // dual-gun unit (CCS-2 + CHAdeMO)
  const ports_available =
    status === 'offline' ? 0 : Math.max(0, Math.round(total_ports * (1 - util / 100)));

  const sessions_today = randInt(6, 40);
  const avg_session_min = randInt(26, 48);

  // 24 hourly points with morning (08–10) & evening (17–20) demand peaks.
  const util_series = Array.from({ length: 24 }, (_, h) => {
    if (status === 'offline') return 0;
    const peak = (h >= 8 && h <= 10) || (h >= 17 && h <= 20);
    const overnight = h < 6;
    const base = peak ? Math.min(100, util + 22) : overnight ? Math.max(0, util - 38) : util;
    return Math.max(0, Math.min(100, Math.round(base + (Math.random() - 0.5) * 16)));
  });

  const ceil = throttleTo != null ? throttleTo : capacity_kw;
  const power_series = util_series.map((u) => Math.min(ceil, round1((capacity_kw * u) / 100)));
  const energy_series = util_series.map((u) => round1((capacity_kw * u) / 100 * 0.92));

  return {
    util,
    current_load_kw,
    peak_capacity_kw: capacity_kw,
    power_output_kw,
    energy_today_kwh,
    revenue_today_inr,
    co2_saved_kg,
    sessions_today,
    avg_session_min,
    total_ports,
    ports_available,
    util_series,
    power_series,
    energy_series,
  };
}

// ----------------------------------------------------------------------------
// ## Digital-Twin component tree builder
// Flat array (rebuildable into SHELL -> CHASSIS -> MODULES via `parentId`).
// Each mesh node's key telemetry is wired to the station's live sensor matrix,
// so clicking a node in the twin shows the same numbers as the macro dashboard.
// ----------------------------------------------------------------------------
function buildComponents(sensors) {
  const s = sensors;

  // derive per-node states from the live sensor values
  const rectState = stateHi(s.rectifier_temp_c, 70, 80);
  const fanState = stateHi(s.fan_vibration_hz, 30, 45);
  const sagState = stateHi(s.voltage_sag_percent, 5, 10);
  const coolState = stateLo(s.coolant_pressure_psi, 26, 20);
  const cableState = stateHi(s.cable_temp_c, 55, 70);
  const thermalState =
    coolState === 'critical' || fanState === 'critical' ? 'critical' :
    coolState === 'warning' || fanState === 'warning' ? 'warning' : 'ok';

  const worst = (...states) =>
    states.includes('critical') ? 'critical' : states.includes('warning') ? 'warning' : 'ok';

  const components = [
    {
      id: 'root_charger_group', name: 'Root Charger Group', parentId: null,
      group: 'ROOT', kind: 'group', status: worst(rectState, fanState, thermalState),
      summary: 'EESL / Delta DC fast-charger · integrated digital twin',
    },

    // ---- SHELL ----------------------------------------------------------
    {
      id: 'front_panel_shell', name: 'Front Panel Shell', parentId: 'root_charger_group',
      group: 'SHELL', kind: 'shell', status: 'ok',
      pos: [0, 0.95, 0.35], explode: [-0.6, 0.0, 1.45], dims: [0.8, 1.66, 0.06],
      telemetry: [
        { key: 'touch_ui', label: 'Touch UI', value: 'Online', unit: '', state: 'ok' },
        { key: 'ui_latency_ms', label: 'UI Latency', value: randInt(28, 52), unit: 'ms', state: 'ok' },
        { key: 'firmware', label: 'HMI Firmware', value: 'v4.2.1', unit: '', state: 'ok' },
        { key: 'enclosure_ip', label: 'Enclosure', value: 'IP54', unit: '', state: 'ok' },
      ],
    },

    // ---- CHASSIS --------------------------------------------------------
    {
      id: 'cabinet_chassis', name: 'Cabinet Chassis', parentId: 'root_charger_group',
      group: 'CHASSIS', kind: 'body', status: worst(rectState, sagState),
      pos: [0, 0.95, 0.0], explode: [0, 0, -0.1], dims: [0.8, 1.66, 0.68],
      telemetry: [
        { key: 'structural_integrity', label: 'Integrity', value: 100, unit: '%', state: 'ok', max: 100 },
        { key: 'door_interlock', label: 'Door Interlock', value: 'Engaged', unit: '', state: 'ok' },
        { key: 'mount', label: 'Mount', value: 'Plinth / Anchored', unit: '', state: 'ok' },
      ],
    },

    // ---- MODULES · power conversion stack -------------------------------
    {
      id: 'power_conversion', name: 'Power Conversion Stack', parentId: 'cabinet_chassis',
      group: 'MODULES', kind: 'group', status: rectState,
      summary: '3× modular AC→DC rectifier',
    },
    {
      id: 'rectifier_01', name: 'Rectifier Module 01', parentId: 'power_conversion',
      group: 'MODULES', kind: 'rectifier', status: 'ok',
      pos: [-0.1, 1.4, -0.04], explode: [-0.15, 0.18, 1.55], dims: [0.46, 0.34, 0.5],
      telemetry: [
        { key: 'rectifier_temp_c', label: 'Rectifier Temp', value: rand(48, 58), unit: '°C', state: 'ok', max: 90, sensor: 'Thermocouple / RTD' },
        { key: 'load_pct', label: 'Load', value: randInt(55, 72), unit: '%', state: 'ok', max: 100 },
        { key: 'efficiency_pct', label: 'Efficiency', value: rand(96.8, 97.6), unit: '%', state: 'ok', max: 100 },
        { key: 'output_dc_v', label: 'Output', value: randInt(715, 725), unit: 'V', state: 'ok' },
      ],
    },
    {
      // The hero fault node — telemetry tied directly to the live matrix.
      id: 'rectifier_02', name: 'Rectifier Module 02', parentId: 'power_conversion',
      group: 'MODULES', kind: 'rectifier', status: rectState,
      pos: [-0.1, 1.02, -0.04], explode: [-0.15, 0.0, 1.75], dims: [0.46, 0.34, 0.5],
      telemetry: [
        { key: 'rectifier_temp_c', label: 'Rectifier Temp', value: s.rectifier_temp_c, unit: '°C', state: rectState, max: 90, sensor: 'Thermocouple / RTD' },
        { key: 'load_pct', label: 'Load', value: rectState === 'critical' ? 92 : randInt(60, 80), unit: '%', state: rectState === 'critical' ? 'warning' : 'ok', max: 100, sensor: 'Hall-effect' },
        { key: 'output_dc_v', label: 'Output', value: rectState === 'critical' ? 0 : randInt(715, 725), unit: 'V', state: rectState },
        { key: 'bus_link', label: 'DC Bus Link', value: rectState === 'critical' ? 'Isolated' : 'Connected', unit: '', state: rectState },
      ],
      annotation: rectState !== 'ok'
        ? { state: rectState, text: `module_02: ${rectState} · ${s.rectifier_temp_c}°C` }
        : undefined,
      alert: rectState === 'critical'
        ? {
            level: 'critical',
            code: 'BLR_RECTIFIER_FAIL',
            title: 'Rectifier Module 02 Failure',
            message: `Temperature limit exceeded (${s.rectifier_temp_c}°C). Module auto-isolated from the DC bus.`,
            auto_action: 'Station output throttled to 50 kW to prevent thermal run-away. Maintenance ticket generated.',
            etf_hrs: 2,
            action: 'Dispatch Maintenance',
          }
        : undefined,
    },
    {
      id: 'rectifier_03', name: 'Rectifier Module 03', parentId: 'power_conversion',
      group: 'MODULES', kind: 'rectifier', status: 'ok',
      pos: [-0.1, 0.64, -0.04], explode: [-0.15, -0.18, 1.55], dims: [0.46, 0.34, 0.5],
      telemetry: [
        { key: 'rectifier_temp_c', label: 'Rectifier Temp', value: rand(47, 56), unit: '°C', state: 'ok', max: 90, sensor: 'Thermocouple / RTD' },
        { key: 'load_pct', label: 'Load', value: randInt(55, 70), unit: '%', state: 'ok', max: 100 },
        { key: 'efficiency_pct', label: 'Efficiency', value: rand(96.9, 97.6), unit: '%', state: 'ok', max: 100 },
        { key: 'output_dc_v', label: 'Output', value: randInt(715, 725), unit: 'V', state: 'ok' },
      ],
    },

    // ---- MODULES · control kernel --------------------------------------
    {
      id: 'control_kernel', name: 'Control Kernel (CCU)', parentId: 'cabinet_chassis',
      group: 'MODULES', kind: 'pcb', status: sagState,
      pos: [0.14, 1.22, -0.16], explode: [0.35, 0.1, 1.6], dims: [0.32, 0.44, 0.03],
      telemetry: [
        { key: 'ccu_firmware', label: 'CCU Firmware', value: 'v4.2.1', unit: '', state: 'ok' },
        { key: 'ocpp_link', label: 'OCPP Link', value: 'Connected', unit: '1.6J', state: 'ok' },
        { key: 'cpu_temp_c', label: 'CPU Temp', value: rand(54, 64), unit: '°C', state: 'ok', max: 95, sensor: 'Thermocouple / RTD' },
        { key: 'voltage_sag_percent', label: 'Voltage Sag', value: s.voltage_sag_percent, unit: '%', state: sagState, max: 15, sensor: 'Hall-effect' },
        { key: 'imu_isolation', label: 'IMU Isolation', value: randInt(700, 760), unit: 'MΩ', state: 'ok' },
      ],
    },

    // ---- MODULES · protection panel ------------------------------------
    {
      id: 'protection_panel', name: 'Protection Panel', parentId: 'cabinet_chassis',
      group: 'MODULES', kind: 'group', status: 'warning',
      summary: 'AC MCCB · DC contactor · surge protection',
    },
    {
      id: 'ac_mccb', name: 'AC MCCB', parentId: 'protection_panel',
      group: 'MODULES', kind: 'breaker', status: 'ok',
      pos: [-0.22, 0.4, 0.02], explode: [-0.35, -0.2, 1.5], dims: [0.14, 0.2, 0.12],
      telemetry: [
        { key: 'state', label: 'State', value: 'Closed', unit: '', state: 'ok' },
        { key: 'rating_a', label: 'Rating', value: 250, unit: 'A', state: 'ok' },
        { key: 'trip_count', label: 'Trips', value: randInt(0, 4), unit: '', state: 'ok' },
      ],
    },
    {
      id: 'dc_contactor', name: 'DC Contactor', parentId: 'protection_panel',
      group: 'MODULES', kind: 'breaker', status: 'warning',
      pos: [0.0, 0.4, 0.02], explode: [0.0, -0.3, 1.6], dims: [0.14, 0.2, 0.12],
      telemetry: [
        { key: 'arc_wear_pct', label: 'Arc Wear', value: randInt(68, 78), unit: '%', state: 'warning', max: 100 },
        { key: 'state', label: 'State', value: 'Closed', unit: '', state: 'ok' },
        { key: 'operations', label: 'Operations', value: randInt(13000, 16000), unit: '', state: 'ok' },
      ],
      annotation: { state: 'warning', text: 'contactor arc wear elevated' },
    },
    {
      id: 'surge_protection', name: 'Surge Protection Device', parentId: 'protection_panel',
      group: 'MODULES', kind: 'breaker', status: 'ok',
      pos: [0.22, 0.4, 0.02], explode: [0.35, -0.2, 1.5], dims: [0.12, 0.18, 0.1],
      telemetry: [
        { key: 'state', label: 'State', value: 'Armed', unit: '', state: 'ok' },
        { key: 'surge_events', label: 'Surge Events', value: randInt(0, 3), unit: '', state: 'ok' },
        { key: 'clamp_v', label: 'Clamp', value: 1.2, unit: 'kV', state: 'ok' },
      ],
    },

    // ---- THERMAL · rear cooling array ----------------------------------
    {
      id: 'thermal_array', name: 'Thermal Array', parentId: 'root_charger_group',
      group: 'THERMAL', kind: 'fandoor', status: thermalState,
      pos: [0, 0.95, -0.35], explode: [0, 0, -1.5], dims: [0.64, 1.42, 0.06],
      telemetry: [
        { key: 'intake_temp_c', label: 'Intake Temp', value: rand(36, 44), unit: '°C', state: thermalState === 'critical' ? 'warning' : thermalState, max: 70, sensor: 'Thermocouple / RTD' },
        { key: 'coolant_pressure_psi', label: 'Coolant Pressure', value: s.coolant_pressure_psi, unit: 'psi', state: coolState, max: 36, sensor: 'Coolant flow-meter' },
        { key: 'airflow_pct', label: 'Airflow', value: randInt(78, 92), unit: '%', state: 'ok', max: 100 },
        { key: 'rectifier_cooling', label: 'Cooling', value: 'Active', unit: '', state: 'ok' },
      ],
    },
    {
      id: 'left_fan', name: 'Left Fan', parentId: 'thermal_array',
      group: 'THERMAL', kind: 'fan', status: fanState,
      pos: [-0.16, 1.42, -0.36], explode: [0, 0, -1.6], dims: [0.13],
      telemetry: [
        { key: 'fan_vibration_hz', label: 'Vibration', value: s.fan_vibration_hz, unit: 'Hz', state: fanState, max: 60, sensor: 'Accelerometer' },
        { key: 'rpm', label: 'Speed', value: randInt(3050, 3200), unit: 'rpm', state: 'ok' },
        { key: 'bearing_health_pct', label: 'Bearing', value: fanState === 'ok' ? randInt(90, 98) : randInt(62, 72), unit: '%', state: fanState, max: 100 },
      ],
      annotation: fanState !== 'ok'
        ? { state: fanState, text: `left_fan: high_vibration · ${s.fan_vibration_hz} Hz` }
        : undefined,
    },
    {
      id: 'right_fan', name: 'Right Fan', parentId: 'thermal_array',
      group: 'THERMAL', kind: 'fan', status: 'ok',
      pos: [0.16, 1.42, -0.36], explode: [0, 0, -1.6], dims: [0.13],
      telemetry: [
        { key: 'fan_vibration_hz', label: 'Vibration', value: rand(9, 14), unit: 'Hz', state: 'ok', max: 60, sensor: 'Accelerometer' },
        { key: 'rpm', label: 'Speed', value: randInt(3050, 3160), unit: 'rpm', state: 'ok' },
        { key: 'bearing_health_pct', label: 'Bearing', value: randInt(92, 98), unit: '%', state: 'ok', max: 100 },
      ],
    },

    // ---- CABLE · holster + CCS gun -------------------------------------
    {
      id: 'cable_assembly', name: 'Cable & Gun Assembly', parentId: 'root_charger_group',
      group: 'CABLE', kind: 'cables', status: cableState,
      pos: [0.43, 1.15, 0.12], explode: [1.35, -0.15, 0.55], dims: [1],
      telemetry: [
        { key: 'cable_temp_c', label: 'Cable Temp', value: s.cable_temp_c, unit: '°C', state: cableState, max: 80, sensor: 'Thermocouple / RTD' },
        { key: 'connector_cycles', label: 'Cycles', value: randInt(6000, 9000), unit: '', state: 'ok' },
        { key: 'gun_lock', label: 'Gun Lock', value: 'Engaged', unit: '', state: 'ok' },
      ],
      annotation: { state: cableState, text: `cable_temp_c: ${s.cable_temp_c}°C` },
    },
  ];

  return components;
}

// ----------------------------------------------------------------------------
// ## Maintenance history builder
// ----------------------------------------------------------------------------
const MAINT_EVENTS = ['Routine Inspection', 'Cable Replacement', 'Firmware Update', 'Coolant Top-up', 'Connector Service', 'Thermal Paste Re-apply', 'Rectifier Board Swap'];
const TECHS = ['T-101', 'T-204', 'T-308', 'T-412', 'T-517'];

function buildMaintenance(n = 4) {
  return Array.from({ length: n }, (_, i) => {
    const month = String(Math.max(1, 6 - i)).padStart(2, '0');
    const day = String(randInt(1, 27)).padStart(2, '0');
    return {
      date: `2026-${month}-${day}`,
      event: MAINT_EVENTS[randInt(0, MAINT_EVENTS.length - 1)],
      status: i === 0 ? 'In Progress' : 'Completed',
      tech: TECHS[randInt(0, TECHS.length - 1)],
    };
  });
}

// ----------------------------------------------------------------------------
// ## Station factory — stitches everything together
// ----------------------------------------------------------------------------
function makeStation(cfg) {
  const perf = buildPerformance(cfg.capacity_kw, cfg.status, cfg.throttleTo);
  const components = buildComponents(cfg.sensors);

  return {
    id: cfg.id,
    Name: cfg.Name,
    vendor_name: cfg.vendor_name || 'EESL',
    model: cfg.model || 'Delta UFC · CCS-2 + CHAdeMO',
    city: cfg.city,
    address: cfg.address,
    latitude: cfg.latitude,
    longitude: cfg.longitude,
    capacity_kw: cfg.capacity_kw,
    status: cfg.status,
    sensors: cfg.sensors,
    ...perf,
    components,
    aiAdvisories: cfg.aiAdvisories || [],
    maintenanceHistory: buildMaintenance(cfg.maintN || 4),
  };
}

// ----------------------------------------------------------------------------
// ## The 5 stations  (Bengaluru + Nagpur hubs)
// ----------------------------------------------------------------------------
const STATION_CONFIGS = [
  // ── 1. THE CRITICAL FAULT NODE ─────────────────────────────────────────
  {
    id: 'EESL-BLR-001',
    Name: 'BESCOM HQ Fast Charger',
    city: 'Bengaluru',
    address: 'BESCOM Corporate Office, K.R. Circle, Bengaluru, Karnataka 560001',
    latitude: 12.9767,
    longitude: 77.5876,
    capacity_kw: 150,
    status: 'critical',
    throttleTo: 50, // auto-throttled by the AI mitigation
    model: 'Delta UFC 150 · CCS-2 + CHAdeMO',
    sensors: {
      rectifier_temp_c: 84.2,   // exact — thermal boundary breached
      fan_vibration_hz: 42.1,   // exact — bearing degradation
      voltage_sag_percent: 12.4,
      coolant_pressure_psi: 18.6,
      cable_temp_c: 67.0,
      ai_risk_score: 91,        // > 85
    },
    maintN: 5,
    aiAdvisories: [
      {
        // ===== The exact advisory card the UI is built around =====
        advisory_id: 'adv_thermal_runaway',
        level: 'critical',
        partId: 'rectifier_02',
        icon: 'memory',
        title: 'Critical Thermal Runaway',
        code: 'BLR_RECTIFIER_FAIL',
        message: 'Rectifier Module 02 thermal boundary exceeded. Sub-nominal health threshold reached.',
        auto_action: 'Throttling station output capacity to 50 kW to prevent physical damage.',
        etf: 2,
        acknowledged: false,
      },
      {
        advisory_id: 'adv_fan_bearing',
        level: 'warning',
        partId: 'left_fan',
        icon: 'mode_fan',
        title: 'Cooling Fan Bearing Degradation',
        code: 'BLR_FAN_VIB_HIGH',
        message: 'Left cooling fan vibration at 42.1 Hz — bearing wear correlated with rising internal ambient temperature.',
        auto_action: 'Cooling redundancy engaged on right fan array. Service ticket generated.',
        etf: 12,
        acknowledged: false,
      },
      {
        advisory_id: 'adv_grid_sag',
        level: 'warning',
        icon: 'bolt',
        title: 'Grid Instability — Voltage Sag',
        code: 'BLR_GRID_SAG',
        message: '12.4% voltage sag detected across the K.R. Circle cluster during peak demand.',
        auto_action: 'Dynamic Load Balancing engaged — redistributing power by vehicle State-of-Charge.',
        etf: 48,
        acknowledged: false,
      },
    ],
  },

  // ── 2. Bengaluru — warning (contactor wear) ────────────────────────────
  {
    id: 'EESL-BLR-002',
    Name: 'Electronic City Hub',
    city: 'Bengaluru',
    address: 'Electronic City Phase 1, Hosur Road, Bengaluru, Karnataka 560100',
    latitude: 12.8452,
    longitude: 77.6602,
    capacity_kw: 100,
    status: 'warning',
    sensors: {
      rectifier_temp_c: 71.5,
      fan_vibration_hz: 33.4,
      voltage_sag_percent: 6.8,
      coolant_pressure_psi: 24.2,
      cable_temp_c: 53.0,
      ai_risk_score: 67,
    },
    aiAdvisories: [
      {
        advisory_id: 'adv_contactor_wear',
        level: 'warning',
        partId: 'dc_contactor',
        icon: 'electrical_services',
        title: 'Contactor Arc Wear Elevated',
        code: 'BLR_DC_CONTACTOR_WEAR',
        message: 'DC contactor arc-wear trending upward across the last 1,200 switching operations.',
        auto_action: 'Replacement scheduled for the next maintenance window. Output unaffected.',
        etf: 720,
        acknowledged: false,
      },
    ],
  },

  // ── 3. Nagpur — online (healthy MIHAN hub) ─────────────────────────────
  {
    id: 'EESL-NGP-001',
    Name: 'MIHAN SEZ Charger',
    city: 'Nagpur',
    address: 'MIHAN SEZ, Khapri, Nagpur, Maharashtra 441108',
    latitude: 21.0853,
    longitude: 79.049,
    capacity_kw: 60,
    status: 'online',
    sensors: {
      rectifier_temp_c: 52.4,
      fan_vibration_hz: 11.8,
      voltage_sag_percent: 2.1,
      coolant_pressure_psi: 31.5,
      cable_temp_c: 36.0,
      ai_risk_score: 14,
    },
    aiAdvisories: [],
  },

  // ── 4. Nagpur — online (Civil Lines) ───────────────────────────────────
  {
    id: 'EESL-NGP-002',
    Name: 'Civil Lines Charger',
    city: 'Nagpur',
    address: 'Civil Lines, Near VCA Stadium, Nagpur, Maharashtra 440001',
    latitude: 21.154,
    longitude: 79.082,
    capacity_kw: 50,
    status: 'online',
    sensors: {
      rectifier_temp_c: 49.7,
      fan_vibration_hz: 10.2,
      voltage_sag_percent: 1.6,
      coolant_pressure_psi: 32.8,
      cable_temp_c: 34.5,
      ai_risk_score: 9,
    },
    aiAdvisories: [],
  },

  // ── 5. Bengaluru — online (Whitefield) ─────────────────────────────────
  {
    id: 'EESL-BLR-003',
    Name: 'Whitefield ITPL Charger',
    city: 'Bengaluru',
    address: 'ITPL Main Road, Whitefield, Bengaluru, Karnataka 560066',
    latitude: 12.9698,
    longitude: 77.75,
    capacity_kw: 100,
    status: 'online',
    sensors: {
      rectifier_temp_c: 55.1,
      fan_vibration_hz: 13.0,
      voltage_sag_percent: 2.8,
      coolant_pressure_psi: 30.1,
      cable_temp_c: 39.5,
      ai_risk_score: 19,
    },
    aiAdvisories: [],
  },
];

// ----------------------------------------------------------------------------
// ## Seed runner
// ----------------------------------------------------------------------------
async function seed() {
  try {
    console.log('🌱 Seeding sajag_db ...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ Connected → ${MONGO_URI}`);

    const docs = STATION_CONFIGS.map(makeStation);

    // Replace the collection wholesale so re-running the seeder is idempotent.
    const deleted = await Station.deleteMany({});
    console.log(`🧹 Cleared ${deleted.deletedCount} existing station(s).`);

    const inserted = await Station.insertMany(docs);
    console.log(`✅ Inserted ${inserted.length} stations:`);
    for (const s of inserted) {
      const flag = s.status === 'critical' ? '🔴' : s.status === 'warning' ? '🟠' : '🟢';
      console.log(`   ${flag} ${s.id.padEnd(13)} ${s.Name.padEnd(26)} ${s.city.padEnd(11)} risk=${s.sensors.ai_risk_score}`);
    }

    // Loud confirmation that the critical fault state landed exactly.
    const crit = inserted.find((s) => s.id === 'EESL-BLR-001');
    console.log('\n🔎 Critical fault check (EESL-BLR-001):');
    console.log(`   status            = ${crit.status}`);
    console.log(`   rectifier_temp_c  = ${crit.sensors.rectifier_temp_c}`);
    console.log(`   fan_vibration_hz  = ${crit.sensors.fan_vibration_hz}`);
    console.log(`   ai_risk_score     = ${crit.sensors.ai_risk_score}`);
    console.log(`   advisory[0].title = "${crit.aiAdvisories[0].title}" (${crit.aiAdvisories[0].code})`);

    console.log('\n🎉 Seed complete.');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected.');
  }
}

seed();
