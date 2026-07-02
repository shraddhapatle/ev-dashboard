// ============================================================================
// Sajag Tactical Command — Digital Twin model
// ----------------------------------------------------------------------------
// Single source of truth for the 360° Digital Twin of the EESL / Delta DC fast
// charger. Defines the recursive component hierarchy (Shell -> Chassis ->
// Modules), per-component synthetic telemetry, and the `assembly_vectors` that
// drive the exploded view (final = assembledPos + explodeVector * alpha).
//
// Geometry is modelled on the real Delta / EESL 150 kW unit: white body with a
// blue diagonal livery, landscape touchscreen, status-light row, e-stop, side
// holster gun, and internals = green modular rectifier stack, control kernel
// PCB, rear 6-fan cooling array, and protection devices.
// ============================================================================

export const STATUS = {
  ok:       { label: 'NOMINAL',  color: '#39ff6a', dot: 'status-ok',   anno: 'annotation-ok' },
  warning: { label: 'WARNING', color: '#f5b544', dot: 'status-warn', anno: 'annotation-warn' },
  critical: { label: 'CRITICAL', color: '#ff5c5c', dot: 'status-crit', anno: 'annotation-crit' },
}

// Macro-level station record (baseline + unified-kernel metrics).
export const station = {
  name: 'Sajag GRID COMMAND',
  station_id: 'EESL-IND-0042',
  vendor: 'EESL / Delta',
  model: 'Delta UFC 150 · CCS-2 + CHAdeMO',
  location: 'NDMC Parking, Khan Market, New Delhi',
  status: 'critical',
  has_digital_twin: true,
  peak_capacity_kw: 150.0,
  current_load_kw: 148.5,
  active_sessions: 3,
  total_ports: 4,
  kernel: {
    grid_stability_factor: 0.96,
    system_resilience_score: 0.98,
    fleet_uptime_pct: 94.2,
    active_anomalies: 1,
  },
}

// ----------------------------------------------------------------------------
// Component tree. Every node:
//   id, name, parentId, kind ('group' | mesh-type), status,
//   pos   -> assembled centre (metres, plinth base at y=0)
//   explode -> assembly_vector displacement applied * alpha
//   dims  -> geometry hint for the mesh
//   telemetry[], alert?, annotation?
// ----------------------------------------------------------------------------
export const parts = [
  {
    id: 'root_charger_group',
    name: 'Root Charger Group',
    parentId: null,
    kind: 'group',
    status: 'critical',
    summary: 'EESL / Delta 150 kW DC fast-charger · integrated digital twin',
  },

  // ---- external white/blue livery door -----------------------------------
  {
    id: 'front_panel_shell',
    name: 'Front Panel Shell',
    parentId: 'root_charger_group',
    kind: 'shell',
    status: 'ok',
    pos: [0, 0.95, 0.35],
    explode: [-0.6, 0.0, 1.45],
    dims: [0.8, 1.66, 0.06],
    telemetry: [
      { key: 'touch_ui', label: 'Touch UI', value: 'Online', unit: '', state: 'ok' },
      { key: 'ui_latency_ms', label: 'UI Latency', value: 38, unit: 'ms', state: 'ok' },
      { key: 'firmware', label: 'HMI Firmware', value: 'v4.2.1', unit: '', state: 'ok' },
      { key: 'enclosure_ip', label: 'Enclosure', value: 'IP54', unit: '', state: 'ok' },
    ],
  },

  // ---- white structural body (open front + rear) -------------------------
  {
    id: 'cabinet_chassis',
    name: 'Cabinet Chassis',
    parentId: 'root_charger_group',
    kind: 'body',
    status: 'ok',
    pos: [0, 0.95, 0.0],
    explode: [0, 0, -0.1],
    dims: [0.8, 1.66, 0.68],
    telemetry: [
      { key: 'structural_integrity', label: 'Integrity', value: 100, unit: '%', state: 'ok' },
      { key: 'door_interlock', label: 'Door Interlock', value: 'Engaged', unit: '', state: 'ok' },
      { key: 'mount', label: 'Mount', value: 'Plinth / Anchored', unit: '', state: 'ok' },
    ],
  },

  // ---- modular power conversion (green rectifier stack) ------------------
  {
    id: 'power_conversion',
    name: 'Power Conversion Stack',
    parentId: 'cabinet_chassis',
    kind: 'group',
    status: 'critical',
    summary: '3× modular AC→DC rectifier · module_02 isolated',
  },
  {
    id: 'rectifier_01',
    name: 'Rectifier Module 01',
    parentId: 'power_conversion',
    kind: 'rectifier',
    status: 'ok',
    pos: [-0.1, 1.4, -0.04],
    explode: [-0.15, 0.18, 1.55],
    dims: [0.46, 0.34, 0.5],
    telemetry: [
      { key: 'rectifier_temp_c', label: 'Rectifier Temp', value: 52.3, unit: '°C', state: 'ok', max: 90 },
      { key: 'load_pct', label: 'Load', value: 68, unit: '%', state: 'ok', max: 100 },
      { key: 'efficiency_pct', label: 'Efficiency', value: 97.1, unit: '%', state: 'ok', max: 100 },
      { key: 'output_dc_v', label: 'Output', value: 720, unit: 'V', state: 'ok' },
    ],
  },
  {
    id: 'rectifier_02',
    name: 'Rectifier Module 02',
    parentId: 'power_conversion',
    kind: 'rectifier',
    status: 'critical',
    pos: [-0.1, 1.02, -0.04],
    explode: [-0.15, 0.0, 1.75],
    dims: [0.46, 0.34, 0.5],
    telemetry: [
      { key: 'rectifier_temp_c', label: 'Rectifier Temp', value: 84.2, unit: '°C', state: 'critical', max: 90, sensor: 'Thermocouple / RTD' },
      { key: 'load_pct', label: 'Load', value: 92, unit: '%', state: 'warning', max: 100, sensor: 'Hall-effect' },
      { key: 'output_dc_v', label: 'Output', value: 0, unit: 'V', state: 'critical' },
      { key: 'bus_link', label: 'DC Bus Link', value: 'Isolated', unit: '', state: 'critical' },
    ],
    annotation: { state: 'critical', text: 'module_02: critical · 84.2°C' },
    alert: {
      level: 'critical',
      code: 'BLR_RECTIFIER_FAIL',
      title: 'Rectifier Module 02 Failure',
      message: 'Temperature limit exceeded (84.2°C). Module auto-isolated from the DC bus.',
      auto_action: 'Station output throttled to 50 kW to prevent thermal run-away. Maintenance ticket generated.',
      etf_hrs: 48,
      action: 'Dispatch Maintenance',
    },
  },
  {
    id: 'rectifier_03',
    name: 'Rectifier Module 03',
    parentId: 'power_conversion',
    kind: 'rectifier',
    status: 'ok',
    pos: [-0.1, 0.64, -0.04],
    explode: [-0.15, -0.18, 1.55],
    dims: [0.46, 0.34, 0.5],
    telemetry: [
      { key: 'rectifier_temp_c', label: 'Rectifier Temp', value: 49.8, unit: '°C', state: 'ok', max: 90 },
      { key: 'load_pct', label: 'Load', value: 61, unit: '%', state: 'ok', max: 100 },
      { key: 'efficiency_pct', label: 'Efficiency', value: 97.4, unit: '%', state: 'ok', max: 100 },
      { key: 'output_dc_v', label: 'Output', value: 721, unit: 'V', state: 'ok' },
    ],
  },

  // ---- control kernel (Central Control & Logic Hub PCB) ------------------
  {
    id: 'control_kernel',
    name: 'Control Kernel (CCU)',
    parentId: 'cabinet_chassis',
    kind: 'pcb',
    status: 'ok',
    pos: [0.14, 1.22, -0.16],
    explode: [0.35, 0.1, 1.6],
    dims: [0.32, 0.44, 0.03],
    telemetry: [
      { key: 'ccu_firmware', label: 'CCU Firmware', value: 'v4.2.1', unit: '', state: 'ok' },
      { key: 'ocpp_link', label: 'OCPP Link', value: 'Connected', unit: '1.6J', state: 'ok' },
      { key: 'cpu_temp_c', label: 'CPU Temp', value: 58.4, unit: '°C', state: 'ok', max: 95, sensor: 'Thermocouple / RTD' },
      { key: 'voltage_sag_percent', label: 'Voltage Sag', value: 2.1, unit: '%', state: 'ok', max: 15, sensor: 'Hall-effect' },
      { key: 'imu_isolation', label: 'IMU Isolation', value: 740, unit: 'MΩ', state: 'ok' },
    ],
  },

  // ---- protection panel ---------------------------------------------------
  {
    id: 'protection_panel',
    name: 'Protection Panel',
    parentId: 'cabinet_chassis',
    kind: 'group',
    status: 'warning',
    summary: 'AC MCCB · DC contactor · surge protection',
  },
  {
    id: 'ac_mccb',
    name: 'AC MCCB',
    parentId: 'protection_panel',
    kind: 'breaker',
    status: 'ok',
    pos: [-0.22, 0.4, 0.02],
    explode: [-0.35, -0.2, 1.5],
    dims: [0.14, 0.2, 0.12],
    telemetry: [
      { key: 'state', label: 'State', value: 'Closed', unit: '', state: 'ok' },
      { key: 'rating_a', label: 'Rating', value: 250, unit: 'A', state: 'ok' },
      { key: 'trip_count', label: 'Trips', value: 3, unit: '', state: 'ok' },
    ],
  },
  {
    id: 'dc_contactor',
    name: 'DC Contactor',
    parentId: 'protection_panel',
    kind: 'breaker',
    status: 'warning',
    pos: [0.0, 0.4, 0.02],
    explode: [0.0, -0.3, 1.6],
    dims: [0.14, 0.2, 0.12],
    telemetry: [
      { key: 'arc_wear_pct', label: 'Arc Wear', value: 74, unit: '%', state: 'warning', max: 100 },
      { key: 'state', label: 'State', value: 'Closed', unit: '', state: 'ok' },
      { key: 'operations', label: 'Operations', value: 14820, unit: '', state: 'ok' },
    ],
    annotation: { state: 'warning', text: 'contactor arc wear: 74%' },
    alert: {
      level: 'warning',
      code: 'DC_CONTACTOR_WEAR',
      title: 'Contactor Arc Wear Elevated',
      message: 'Arc wear level at 74%. Schedule contact replacement within the next maintenance window.',
      etf_hrs: 720,
      action: 'Schedule Service',
    },
  },
  {
    id: 'surge_protection',
    name: 'Surge Protection Device',
    parentId: 'protection_panel',
    kind: 'breaker',
    status: 'ok',
    pos: [0.22, 0.4, 0.02],
    explode: [0.35, -0.2, 1.5],
    dims: [0.12, 0.18, 0.1],
    telemetry: [
      { key: 'state', label: 'State', value: 'Armed', unit: '', state: 'ok' },
      { key: 'surge_events', label: 'Surge Events', value: 2, unit: '', state: 'ok' },
      { key: 'clamp_v', label: 'Clamp', value: 1.2, unit: 'kV', state: 'ok' },
    ],
  },

  // ---- rear thermal / cooling array (6-fan door) -------------------------
  {
    id: 'thermal_array',
    name: 'Thermal Array',
    parentId: 'root_charger_group',
    kind: 'fandoor',
    status: 'warning',
    pos: [0, 0.95, -0.35],
    explode: [0, 0, -1.5],
    dims: [0.64, 1.42, 0.06],
    telemetry: [
      { key: 'intake_temp_c', label: 'Intake Temp', value: 41.0, unit: '°C', state: 'warning', max: 70, sensor: 'Thermocouple / RTD' },
      { key: 'coolant_pressure_psi', label: 'Coolant Pressure', value: 24.5, unit: 'psi', state: 'warning', max: 36, sensor: 'Coolant flow-meter' },
      { key: 'airflow_pct', label: 'Airflow', value: 83, unit: '%', state: 'ok', max: 100 },
      { key: 'rectifier_cooling', label: 'Cooling', value: 'Active', unit: '', state: 'ok' },
    ],
  },
  {
    id: 'left_fan',
    name: 'Left Fan',
    parentId: 'thermal_array',
    kind: 'fan',
    status: 'warning',
    pos: [-0.16, 1.42, -0.36],
    explode: [0, 0, -1.6],
    dims: [0.13],
    telemetry: [
      { key: 'fan_vibration_hz', label: 'Vibration', value: 42.1, unit: 'Hz', state: 'warning', max: 60, sensor: 'Accelerometer' },
      { key: 'rpm', label: 'Speed', value: 3120, unit: 'rpm', state: 'ok' },
      { key: 'bearing_health_pct', label: 'Bearing', value: 68, unit: '%', state: 'warning', max: 100 },
    ],
    annotation: { state: 'warning', text: 'left_fan: high_vibration · 42.1 Hz' },
    alert: {
      level: 'warning',
      code: 'FAN_VIB_HIGH',
      title: 'Cooling Fan #2 Bearing Degradation',
      message:
        'Predictive anomaly detected: Cooling Fan #2 bearing degradation correlated with a 15% increase in ambient internal temperature. Estimated Time to Failure (ETF): 48 Hours.',
      auto_action: 'Station output automatically throttled to 50 kW to prevent thermal run-away. Maintenance ticket generated.',
      etf_hrs: 48,
      action: 'Schedule Service',
    },
  },
  {
    id: 'right_fan',
    name: 'Right Fan',
    parentId: 'thermal_array',
    kind: 'fan',
    status: 'ok',
    pos: [0.16, 1.42, -0.36],
    explode: [0, 0, -1.6],
    dims: [0.13],
    telemetry: [
      { key: 'fan_vibration_hz', label: 'Vibration', value: 11.4, unit: 'Hz', state: 'ok', max: 60 },
      { key: 'rpm', label: 'Speed', value: 3100, unit: 'rpm', state: 'ok' },
      { key: 'bearing_health_pct', label: 'Bearing', value: 96, unit: '%', state: 'ok', max: 100 },
    ],
  },

  // ---- side holster + CCS gun + cable ------------------------------------
  {
    id: 'cable_assembly',
    name: 'Cable & Gun Assembly',
    parentId: 'root_charger_group',
    kind: 'cables',
    status: 'ok',
    pos: [0.43, 1.15, 0.12],
    explode: [1.35, -0.15, 0.55],
    dims: [1],
    telemetry: [
      { key: 'cable_temp_c', label: 'Cable Temp', value: 38.0, unit: '°C', state: 'ok', max: 80, sensor: 'Thermocouple / RTD' },
      { key: 'connector_cycles', label: 'Cycles', value: 8420, unit: '', state: 'ok' },
      { key: 'gun_lock', label: 'Gun Lock', value: 'Engaged', unit: '', state: 'ok' },
    ],
    annotation: { state: 'ok', text: 'cable_temp_c: 38.0°C' },
  },
]

// ---- lookups & helpers -----------------------------------------------------
export const partsById = Object.fromEntries(parts.map((p) => [p.id, p]))
export const meshParts = parts.filter((p) => p.kind !== 'group')

export function getPart(id) {
  return partsById[id]
}

export function buildTree() {
  const nodes = Object.fromEntries(parts.map((p) => [p.id, { ...p, children: [] }]))
  const roots = []
  for (const p of parts) {
    if (p.parentId && nodes[p.parentId]) nodes[p.parentId].children.push(nodes[p.id])
    else roots.push(nodes[p.id])
  }
  return roots
}

export const alerts = parts
  .filter((p) => p.alert)
  .sort((a, b) => (a.alert.level === 'critical' ? -1 : 1))

// ----------------------------------------------------------------------------
// Enterprise AI advisory feed — translates the raw sensor matrix into plain-
// English, actionable intelligence (the "brain" of the dashboard).
// ----------------------------------------------------------------------------
export const aiAdvisories = [
  {
    id: 'adv_hw_degradation',
    level: 'critical',
    partId: 'rectifier_02',
    icon: 'memory',
    title: 'Predictive Anomaly Detected',
    advisory:
      'Cooling Fan #2 bearing degradation correlated with a steady 15% rise in internal ambient temperature over 4 hours. Rectifier Module 02 thermal limit breached (84.2°C).',
    action: 'System auto-throttled station output to 50 kW to prevent thermal run-away. Maintenance ticket generated.',
    etf: 'ETF: 48 Hours',
  },
  {
    id: 'adv_grid_imbalance',
    level: 'warning',
    icon: 'bolt',
    title: 'Grid Instability — Voltage Sag',
    advisory:
      '12% voltage sag detected across the Malleshwaram cluster (4 stations) due to peak neighbourhood energy demand.',
    action:
      'Initiating Dynamic Load Balancing (DLB) — redistributing power by vehicle State-of-Charge, prioritising high-need vehicles to prevent local transformer trip.',
    etf: 'Cluster: 4 stations',
  },
  {
    id: 'adv_contactor',
    level: 'warning',
    partId: 'dc_contactor',
    icon: 'electrical_services',
    title: 'Contactor Arc Wear Elevated',
    advisory: 'DC contactor arc-wear at 74%; switching transients trending upward across the last 1,200 operations.',
    action: 'Replacement scheduled in next maintenance window. Output unaffected.',
    etf: 'ETF: 720 Hours',
  },
]
