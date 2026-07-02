// ============================================================================
// routes/stationRoutes.js
// ----------------------------------------------------------------------------
// # Station REST endpoints
//
//   | Method | Path                       | Purpose                              |
//   |--------|----------------------------|--------------------------------------|
//   | GET    | /api/stations              | Whole network → map markers + cards  |
//   | GET    | /api/stations/:id          | Deep, component-level station detail |
//   | POST   | /api/stations/:id/action   | Mock operator action (re-route, etc) |
//
// Every handler is wrapped so async errors are forwarded to the global error
// handler in `server.js` (no unhandled promise rejections).
// ============================================================================

const express = require('express');
const Station = require('../models/Station');

const router = express.Router();

// ----------------------------------------------------------------------------
// ## Helper: wrap async handlers so rejected promises hit `next(err)`
// ----------------------------------------------------------------------------
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ----------------------------------------------------------------------------
// ## GET /api/stations
// Returns the entire network. Supports light query filtering so the frontend
// can drive its status tabs server-side if it wants:
//   /api/stations?status=critical
//   /api/stations?city=Bengaluru
//   /api/stations?fields=list   (lean projection for fast map/marker loads)
// ----------------------------------------------------------------------------
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, city, fields } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (city) filter.city = new RegExp(city, 'i'); // case-insensitive contains

    // A trimmed projection keeps the map-marker payload small; the heavy
    // component tree is only needed on the detail screen.
    const projection =
      fields === 'list'
        ? 'id Name vendor_name city address latitude longitude capacity_kw status ' +
          'current_load_kw peak_capacity_kw util power_output_kw energy_today_kwh ' +
          'revenue_today_inr co2_saved_kg sessions_today avg_session_min ' +
          'ports_available total_ports util_series power_series energy_series sensors'
        : undefined;

    // Use full Mongoose documents so the `performance` virtual (and any other
    // virtuals) are included in the JSON response via the schema's
    // `toJSON: { virtuals: true }` option. `.lean()` skips virtual getters
    // in Mongoose 8 when the schema does not have a lean plugin configured.
    const docs = await Station.find(filter, projection).sort({ id: 1 });
    const stations = docs.map((d) => d.toJSON());

    res.json({
      ok: true,
      count: stations.length,
      stations,
    });
  })
);

// ----------------------------------------------------------------------------
// ## GET /api/stations/:id
// Full, deep record for the Digital Twin / Full View. `:id` is the business id
// (e.g. "EESL-BLR-001"), not the Mongo `_id`.
// ----------------------------------------------------------------------------
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await Station.findOne({ id: req.params.id });

    if (!doc) {
      return res.status(404).json({
        ok: false,
        error: 'StationNotFound',
        message: `No station with id "${req.params.id}".`,
      });
    }

    res.json({ ok: true, station: doc.toJSON() });
  })
);

// ----------------------------------------------------------------------------
// ## POST /api/stations/:id/action
// Mock control-plane endpoint. Simulates the operator confirming an action from
// the AI advisory feed (re-route power, throttle, dispatch a technician,
// acknowledge an advisory, reset a component). Known actions apply a light,
// realistic state change and persist it; everything returns a structured
// confirmation envelope the UI can echo into its activity log.
//
//   Body: {
//     "action": "reroute_power" | "throttle_output" | "dispatch_technician"
//             | "acknowledge_advisory" | "reset_component",
//     "partId":     "rectifier_02",     // optional, for component-scoped actions
//     "advisoryId": "adv_hw_degradation",// optional, for acknowledge
//     "params":     { "target_kw": 50 }  // optional action parameters
//   }
// ----------------------------------------------------------------------------
router.post(
  '/:id/action',
  asyncHandler(async (req, res) => {
    const { action, partId, advisoryId, params = {} } = req.body || {};

    // -- validation --------------------------------------------------------
    if (!action || typeof action !== 'string') {
      return res.status(400).json({
        ok: false,
        error: 'BadRequest',
        message: 'Body must include a non-empty "action" string.',
      });
    }

    const station = await Station.findOne({ id: req.params.id });
    if (!station) {
      return res.status(404).json({
        ok: false,
        error: 'StationNotFound',
        message: `No station with id "${req.params.id}".`,
      });
    }

    // -- simulate the action ----------------------------------------------
    const commandId = `CMD-${Date.now().toString(36).toUpperCase()}`;
    const executedAt = new Date().toISOString();
    let message;
    const effect = {};

    switch (action) {
      case 'reroute_power':
      case 'throttle_output': {
        const target = Number(params.target_kw) || 50;
        station.power_output_kw = target;
        station.current_load_kw = Math.min(station.current_load_kw || target, target);
        effect.power_output_kw = target;
        message = `Station output re-routed / throttled to ${target} kW. Load balanced across healthy modules.`;
        break;
      }

      case 'dispatch_technician': {
        const ticket = {
          event: params.event || 'Emergency Service — AI Advisory',
          date: executedAt.slice(0, 10),
          status: 'Scheduled',
          tech: params.tech || 'T-204',
          notes: partId ? `Auto-dispatched for component ${partId}.` : 'Auto-dispatched from advisory feed.',
        };
        station.maintenanceHistory.unshift(ticket);
        effect.ticket = ticket;
        message = `Maintenance technician ${ticket.tech} dispatched. Ticket logged.`;
        break;
      }

      case 'acknowledge_advisory': {
        const adv = station.aiAdvisories.find(
          (a) => a.advisory_id === advisoryId || a.code === advisoryId
        );
        if (adv) {
          adv.acknowledged = true;
          effect.acknowledged = adv.advisory_id || adv.code;
          message = `Advisory "${adv.title}" acknowledged by operator.`;
        } else {
          message = advisoryId
            ? `No advisory matching "${advisoryId}" found; acknowledgement recorded anyway (mock).`
            : 'All advisories acknowledged (mock).';
        }
        break;
      }

      case 'reset_component': {
        const comp = station.components.find((c) => c.id === partId);
        if (comp) {
          comp.status = 'ok';
          effect.component = { id: comp.id, status: 'ok' };
          message = `Component "${partId}" reset to nominal (mock).`;
        } else {
          message = `Component "${partId}" not found; no change applied.`;
        }
        break;
      }

      default:
        // Unknown but well-formed action → accept as a mock no-op.
        message = `Action "${action}" received and simulated. No state change applied.`;
        break;
    }

    await station.save();

    res.json({
      ok: true,
      command_id: commandId,
      station_id: station.id,
      action,
      executed_at: executedAt,
      status: 'CONFIRMED',
      message,
      effect,
      // echo the new station status so the UI can refresh without a second call
      station_status: station.status,
    });
  })
);

module.exports = router;
