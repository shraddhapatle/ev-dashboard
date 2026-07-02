# Sajag EV Dashboard — Local Backend (POC)

A small Express + Mongoose API that feeds the EV Charging Infrastructure
Dashboard: map markers, station performance cards, line-chart series, the
Three.js Digital Twin component tree, and the AI Advisory feed.

## Stack
- **Express** — HTTP + routing
- **Mongoose** — MongoDB ODM
- **cors**, **dotenv** — config & cross-origin access
- **nodemon** — dev auto-reload

## Folder layout
```
backend/
├── server.js              # entry point: Mongo connect, CORS, middleware, routes
├── seed.js                # populates 5 Bengaluru/Nagpur stations (run once)
├── models/
│   └── Station.js         # the comprehensive Station schema
├── routes/
│   └── stationRoutes.js   # GET /, GET /:id, POST /:id/action
├── .env                   # PORT, MONGO_URI, CORS_ORIGINS
└── package.json
```

## Prerequisites
- Node.js 18+
- A local MongoDB running at `mongodb://localhost:27017`
  - Verify: `mongosh --eval "db.runCommand({ ping: 1 })"`
  - If `mongod` is installed as a Windows service it is usually already running.

## Run it
```bash
cd backend
npm install        # install dependencies
npm run seed       # populate sajag_db with 5 stations (idempotent)
npm run dev        # start API on http://localhost:5000 (nodemon)
# or: npm start
```

## API
| Method | Path                      | Description |
|--------|---------------------------|-------------|
| GET    | `/`                       | Service + DB health summary |
| GET    | `/api/health`             | Health probe |
| GET    | `/api/stations`           | Whole network (map markers + cards). Filters: `?status=`, `?city=`, `?fields=list` |
| GET    | `/api/stations/:id`       | Deep, component-level station record (Digital Twin / Full View) |
| POST   | `/api/stations/:id/action`| Mock operator action |

### `POST /api/stations/:id/action` body
```jsonc
{
  "action": "reroute_power",      // throttle_output | dispatch_technician
                                  // | acknowledge_advisory | reset_component
  "partId": "rectifier_02",       // optional (component-scoped actions)
  "advisoryId": "adv_thermal_runaway", // optional (acknowledge)
  "params": { "target_kw": 50 }   // optional parameters
}
```
Returns a `CONFIRMED` envelope with a `command_id`, a human-readable `message`,
and the `effect` applied.

## Data shape notes (frontend wiring)
The schema stores performance metrics **flat** (e.g. `station.util_series`) as
specified, and the API **also** serialises a read-only `performance` virtual
(`station.performance.util_series`) so the existing React components keep working
unchanged. `sensors` is nested, and `components[]` carries the real Three.js node
ids (`rectifier_02`, `left_fan`, …) with a `parentId` flat tree that rebuilds
into the **SHELL → CHASSIS → MODULES** hierarchy.

To point the frontend at this API instead of the static CSV, replace the body of
`loadStations()` in `src/data/stations.js` with:
```js
const res = await fetch('http://localhost:5000/api/stations')
const { stations } = await res.json()
return stations
```

## Seeded fault state (EESL-BLR-001 · BESCOM HQ, Bengaluru)
- `status: 'critical'`
- `sensors.rectifier_temp_c = 84.2`, `sensors.fan_vibration_hz = 42.1`, `ai_risk_score = 91`
- Advisory: **"Critical Thermal Runaway"** (`BLR_RECTIFIER_FAIL`), auto-throttle to 50 kW, ETF 2h
- `components.rectifier_02` → `critical`, isolated from the DC bus
