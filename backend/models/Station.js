// ============================================================================
// models/Station.js
// ----------------------------------------------------------------------------
// # Station schema — EESL / Delta dual-gun DC fast charger
//
// Single Mongoose document that backs **every** view in the Sajag dashboard:
//
//   - **Map canvas markers**        -> `id, Name, city, address, status, lat/lng`
//   - **Station Navigator / cards** -> top-level performance metrics
//   - **Line charts**               -> `util_series, power_series, energy_series`
//   - **Digital Twin (Three.js)**   -> `components[]` (flat tree via `parentId`,
//                                       SHELL -> CHASSIS -> MODULES) + `sensors`
//   - **AI Advisory feed**          -> `aiAdvisories[]`
//   - **Maintenance log**           -> `maintenanceHistory[]`
//
// The flat performance fields are stored exactly as listed in the spec, and a
// read-only `performance` virtual re-groups them so the existing frontend, which
// reads `station.performance.util_series`, keeps working unchanged.
// ============================================================================

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ----------------------------------------------------------------------------
// ## Sub-schema: Live sensor matrix
// Physical sensor model: Thermocouple/RTD (temps), Hall-effect (voltage sag),
// accelerometer (fan vibration), coolant flow-meter (coolant pressure).
// ----------------------------------------------------------------------------
const SensorSchema = new Schema(
  {
    rectifier_temp_c: { type: Number, default: 0 },     // Thermocouple / RTD  (°C)
    fan_vibration_hz: { type: Number, default: 0 },     // Accelerometer       (Hz)
    voltage_sag_percent: { type: Number, default: 0 },  // Hall-effect         (%)
    coolant_pressure_psi: { type: Number, default: 0 }, // Coolant flow-meter  (psi)
    cable_temp_c: { type: Number, default: 0 },         // Thermocouple / RTD  (°C)
    ai_risk_score: { type: Number, default: 0, min: 0, max: 100 }, // 0–100 composite
  },
  { _id: false }
);

// ----------------------------------------------------------------------------
// ## Sub-schema: Component telemetry row
// One row inside a Digital-Twin component drawer. `value` is intentionally
// `Mixed` because it can be numeric (84.2) or a label ('Isolated', 'v4.2.1').
// ----------------------------------------------------------------------------
const TelemetryRowSchema = new Schema(
  {
    key: { type: String, required: true },              // e.g. 'rectifier_temp_c'
    label: { type: String, required: true },            // e.g. 'Rectifier Temp'
    value: { type: Schema.Types.Mixed, required: true },// number OR string
    unit: { type: String, default: '' },                // e.g. '°C', '%', 'V'
    state: { type: String, enum: ['ok', 'warning', 'critical'], default: 'ok' },
    max: { type: Number },                              // optional gauge ceiling
    sensor: { type: String },                          // optional sensor model name
  },
  { _id: false }
);

// ----------------------------------------------------------------------------
// ## Sub-schema: Per-component alert (drives the red/amber annotation pins)
// ----------------------------------------------------------------------------
const ComponentAlertSchema = new Schema(
  {
    level: { type: String, enum: ['info', 'warning', 'critical'], default: 'warning' },
    code: { type: String },                             // e.g. 'BLR_RECTIFIER_FAIL'
    title: { type: String },
    message: { type: String },
    auto_action: { type: String },
    etf_hrs: { type: Number },                          // estimated time to failure (hrs)
    action: { type: String },                           // CTA label, e.g. 'Dispatch Maintenance'
  },
  { _id: false }
);

// ----------------------------------------------------------------------------
// ## Sub-schema: Digital-Twin component node
// `id` matches the Three.js mesh id. `parentId` lets the frontend rebuild the
// exact SHELL -> CHASSIS -> MODULES hierarchy (see frontend `buildTree()`).
// `group` is the coarse hierarchy band for quick filtering.
// `pos / explode / dims` are the geometry hints the exploded view animates with.
// ----------------------------------------------------------------------------
const ComponentSchema = new Schema(
  {
    id: { type: String, required: true },               // 'rectifier_02', 'left_fan', ...
    name: { type: String, required: true },
    parentId: { type: String, default: null },          // null = root node
    group: {                                            // coarse hierarchy band
      type: String,
      enum: ['SHELL', 'CHASSIS', 'MODULES', 'THERMAL', 'CABLE', 'ROOT'],
      default: 'MODULES',
    },
    kind: { type: String, default: 'group' },           // 'group' | mesh-type (rectifier/fan/pcb/...)
    status: { type: String, enum: ['ok', 'warning', 'critical'], default: 'ok' },
    summary: { type: String },                          // shown for group nodes
    pos: { type: [Number] },                            // [x, y, z] assembled centre
    explode: { type: [Number] },                        // [x, y, z] exploded displacement
    dims: { type: [Number] },                           // geometry hint
    telemetry: { type: [TelemetryRowSchema], default: [] },
    annotation: {                                        // optional floating label
      type: new Schema(
        { state: String, text: String },
        { _id: false }
      ),
    },
    alert: { type: ComponentAlertSchema },              // optional per-node alert
  },
  { _id: false }
);

// ----------------------------------------------------------------------------
// ## Sub-schema: AI Advisory card (the "brain" of the dashboard)
// Field names follow the spec (title / code / message / auto_action / etf) and
// add frontend-friendly metadata (level / partId / icon / acknowledged).
// ----------------------------------------------------------------------------
const AiAdvisorySchema = new Schema(
  {
    advisory_id: { type: String },                      // e.g. 'adv_hw_degradation'
    level: { type: String, enum: ['info', 'warning', 'critical'], default: 'critical' },
    partId: { type: String },                           // links to a component id
    icon: { type: String, default: 'memory' },          // material-symbol name
    title: { type: String, required: true },            // "Critical Thermal Runaway"
    code: { type: String },                             // "BLR_RECTIFIER_FAIL"
    message: { type: String, required: true },          // human-readable anomaly text
    auto_action: { type: String },                      // automated mitigation taken
    etf: { type: Number },                              // estimated time to failure (hours)
    acknowledged: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ----------------------------------------------------------------------------
// ## Sub-schema: Maintenance history event
// ----------------------------------------------------------------------------
const MaintenanceSchema = new Schema(
  {
    event: { type: String, required: true },            // 'Cable Replacement', ...
    date: { type: String, required: true },             // ISO date string 'YYYY-MM-DD'
    status: { type: String, enum: ['Completed', 'In Progress', 'Scheduled'], default: 'Completed' },
    tech: { type: String },                             // technician signature, e.g. 'T-204'
    notes: { type: String },
  },
  { _id: false }
);

// ----------------------------------------------------------------------------
// ## Root: Station document
// ----------------------------------------------------------------------------
const StationSchema = new Schema(
  {
    // ----- Metadata -------------------------------------------------------
    id: { type: String, required: true, unique: true, index: true }, // 'EESL-BLR-001'
    Name: { type: String, required: true },             // capital N — matches frontend reads
    vendor_name: { type: String, default: 'EESL' },
    model: { type: String, default: 'Delta UFC · CCS-2 + CHAdeMO' },
    city: { type: String, index: true },
    address: { type: String },
    latitude: { type: Number },                         // map marker
    longitude: { type: Number },                        // map marker
    capacity_kw: { type: Number, default: 50 },
    status: {
      type: String,
      enum: ['online', 'warning', 'critical', 'offline'],
      default: 'online',
      index: true,
    },

    // ----- Performance metrics (stored flat, per spec) --------------------
    current_load_kw: { type: Number, default: 0 },
    peak_capacity_kw: { type: Number, default: 0 },
    util: { type: Number, default: 0 },                 // utilisation %
    power_output_kw: { type: Number, default: 0 },
    energy_today_kwh: { type: Number, default: 0 },
    revenue_today_inr: { type: Number, default: 0 },
    co2_saved_kg: { type: Number, default: 0 },
    sessions_today: { type: Number, default: 0 },
    avg_session_min: { type: Number, default: 0 },
    ports_available: { type: Number, default: 0 },
    total_ports: { type: Number, default: 2 },

    // ----- Time-series (24 hourly points each) ----------------------------
    util_series: { type: [Number], default: [] },
    power_series: { type: [Number], default: [] },
    energy_series: { type: [Number], default: [] },

    // ----- Live sensor matrix --------------------------------------------
    sensors: { type: SensorSchema, default: () => ({}) },

    // ----- Digital-Twin component tree -----------------------------------
    components: { type: [ComponentSchema], default: [] },

    // ----- AI advisory feed ----------------------------------------------
    aiAdvisories: { type: [AiAdvisorySchema], default: [] },

    // ----- Maintenance history -------------------------------------------
    maintenanceHistory: { type: [MaintenanceSchema], default: [] },
  },
  {
    timestamps: true, // createdAt / updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ----------------------------------------------------------------------------
// ## Virtual: `performance`
// Re-groups the flat performance fields into the nested object the existing
// frontend reads (`station.performance.util_series`, etc.). Because the schema
// is configured with `toJSON: { virtuals: true }`, this is serialised into
// every API response with **zero extra storage**.
// ----------------------------------------------------------------------------
StationSchema.virtual('performance').get(function () {
  return {
    util: this.util,
    power_output_kw: this.power_output_kw,
    energy_today_kwh: this.energy_today_kwh,
    revenue_today_inr: this.revenue_today_inr,
    co2_saved_kg: this.co2_saved_kg,
    sessions_today: this.sessions_today,
    avg_session_min: this.avg_session_min,
    total_ports: this.total_ports,
    ports_available: this.ports_available,
    util_series: this.util_series,
    power_series: this.power_series,
    energy_series: this.energy_series,
    maintenance_history: this.maintenanceHistory,
  };
});

// `total` mirror — the frontend twin adapter reads `Number(s.total)`.
StationSchema.virtual('total').get(function () {
  return this.total_ports;
});

module.exports = mongoose.model('Station', StationSchema);
