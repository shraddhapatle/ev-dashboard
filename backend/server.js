// ============================================================================
// server.js
// ----------------------------------------------------------------------------
// # Sajag EV Dashboard — API entry point
//
// Responsibilities:
//   1. Load environment config (`dotenv`)
//   2. Connect to local MongoDB (`sajag_db`) with fast-fail + clear logging
//   3. Configure robust CORS for the Vite frontend
//   4. Mount JSON body parsing + request logging middleware
//   5. Mount the `/api/stations` router
//   6. Expose a health probe, a 404 handler, and a global error handler
//   7. Shut down gracefully on SIGINT / SIGTERM
// ============================================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const stationRoutes = require('./routes/stationRoutes');

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sajag_db';

// ----------------------------------------------------------------------------
// ## CORS
// Reflect any of the configured browser origins. If `CORS_ORIGINS` is empty we
// reflect *all* origins, which is convenient for a purely local POC. Tighten
// this for any non-local deployment.
// ----------------------------------------------------------------------------
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // allow same-origin / curl / server-to-server (no Origin header)
      if (!origin) return callback(null, true);
      // empty allow-list => reflect everything (local POC default)
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} is not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// ----------------------------------------------------------------------------
// ## Body parsing + lightweight request logger
// ----------------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ----------------------------------------------------------------------------
// ## Health / readiness probe
// ----------------------------------------------------------------------------
app.get('/', (_req, res) => {
  res.json({
    service: 'Sajag EV Dashboard API',
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: [
      'GET  /api/stations',
      'GET  /api/stations/:id',
      'POST /api/stations/:id/action',
    ],
  });
});

app.get('/api/health', (_req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    ok: true,
    db: states[mongoose.connection.readyState] || 'unknown',
    uptime_s: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------------------------------
// ## Routes
// ----------------------------------------------------------------------------
app.use('/api/stations', stationRoutes);

// ----------------------------------------------------------------------------
// ## 404 — unknown route
// ----------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Not Found',
    message: `No route matches ${req.method} ${req.originalUrl}`,
  });
});

// ----------------------------------------------------------------------------
// ## Global error handler
// Any `next(err)` or thrown error in an async handler lands here.
// ----------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    error: err.name || 'InternalServerError',
    message: err.message || 'Something went wrong on the server.',
  });
});

// ----------------------------------------------------------------------------
// ## Boot sequence — connect to Mongo first, then listen
// ----------------------------------------------------------------------------
async function start() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // fail fast if mongod isn't running
    });
    console.log(`✅ MongoDB connected → ${MONGO_URI}`);

    const server = app.listen(PORT, () => {
      console.log(`🚀 API listening on http://localhost:${PORT}`);
      console.log(`   Try:  http://localhost:${PORT}/api/stations`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌  Port ${PORT} is already in use.`);
        console.error(`   A previous server session is still running.`);
        console.error(`   Run this in a new terminal, then retry npm run dev:\n`);
        console.error(`   Windows:  netstat -ano | findstr ":${PORT}"`);
        console.error(`             taskkill /F /PID <PID from above>\n`);
        console.error(`   Mac/Linux: lsof -ti :${PORT} | xargs kill -9\n`);
        process.exit(1);
      } else {
        throw err;
      }
    });

    // graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received — closing server...`);
      server.close(async () => {
        await mongoose.connection.close();
        console.log('Connections closed. Bye 👋');
        process.exit(0);
      });
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    console.error('   Is MongoDB running on', MONGO_URI, '?');
    process.exit(1);
  }
}

// surface unexpected async failures instead of dying silently
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

start();

module.exports = app; // exported for testing
