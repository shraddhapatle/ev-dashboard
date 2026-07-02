# Sajag — EV Charging Infrastructure Dashboard

> *Sajag* (सजग) — Hindi for **"alert, vigilant, aware."**  
> The name reflects exactly what this platform is built to do: stay constantly watchful over critical charging infrastructure so that field teams don't have to.

I choose EESL because it is a government agency that is deploying DC fast chargers across multiple cities in India. Also major AI companies more likely to work in government  sector or for AI innovation in India. made using real datasets of EESL stations. 

---

## Why This Was Built

India's electric-vehicle charging network is growing rapidly, with agencies like EESL deploying DC fast-chargers across multiple cities. Managing these stations today is largely reactive — faults are discovered only after a charger goes offline, a field technician is dispatched, and revenue is already lost.

Sajag was built to flip that model from **reactive to predictive**. The goal is a single command-centre view where an operator can see the health of every station on a live map, drill into sensor telemetry, catch anomalies before they become failures, and even inspect a 3-D digital twin of the physical charger — all without leaving the browser.

The dashboard was developed to demonstrate how modern web technologies can be applied to real-world infrastructure monitoring at scale.

---

## What It Does (Current Demo)

### 1 — Live Map View
A dark, tactical map of India renders all EESL stations as colour-coded markers:

| Colour | Meaning |
|--------|---------|
| 🔴 Red pulsing | Critical fault — immediate attention required |
| 🟠 Orange pulsing | Warning — degraded performance |
| 🟢 Green | Online and healthy |

Clicking any marker slides open a **Station Analytics Panel** showing real-time KPIs: power output, energy delivered today, revenue, session count, utilisation gauge, and live sensor readings (rectifier temperature, fan vibration, battery voltage, etc.).

### 2 — Station Detail Page
A full-page drill-down with:
- Six KPI cards
- 24-hour trend charts (power, temperature, sessions)
- Maintenance history log
- AI Risk Score (0–100) with plain-language advisories
- **Real data ingestion** — replace seeded fixtures with live telemetry streamed from actual charger data sets

### 3 — Digital Twin
Clicking **"Launch Digital Twin"** opens a real-time 3-D model of the DC fast-charger built entirely in WebGL. The operator can:
- Browse the **component tree** (Cabinet → Power Conversion → Rectifier modules, cooling fans, etc.)
- Select any component to highlight it in the scene and read its live sensor values
- Use the **Explode** slider to pull the model apart and see internal subsystems
- Hit **"Isolate Anomaly"** to auto-focus the failing component with a fault overlay

### 4 — Role-Based Access
Three login roles are supported:
- **Operator** — full dashboard + digital twin access
- **App User** — simplified station list view
- **Mobile User** — alerts-only view for field technicians

---

## Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 18 + Vite | Component-based UI with fast hot-module reload |
| React Three Fiber + Three.js | WebGL 3-D digital twin rendering |
| @react-three/drei | Camera controls, post-processing helpers |
| React Leaflet + Leaflet | Interactive map with custom marker layers |
| Tailwind CSS | Utility-first styling |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Document store for station data and telemetry |
| dotenv | Environment configuration |
| nodemon | Auto-reload during development |

### Design System
A custom **"Obsidian Neon"** dark theme — deep-space near-black surfaces, neon teal accents, glassmorphism panels, and JetBrains Mono for tactical data labels. Built for high-focus, low-fatigue environments.

---


## What's Next — Planned Improvements

This demo covers the core monitoring and visualisation loop. The following features are planned for the next stage:

### Near-Term

- **WebSocket push** — replace polling with a live push channel so the map updates instantly when a station changes status
- **Predictive fault model** — train a lightweight ML model on historical sensor curves to generate risk scores from real patterns rather than static rules

### Medium-Term
- **Alerts & notifications** — push alerts to field technician mobile devices when the risk score crosses a configurable threshold
- **Work-order management** — create, assign, and close maintenance tickets directly from the diagnostics panel
- **Multi-tenant support** — allow different fleet operators to log in and see only their own stations

### Longer-Term
- **Animated digital twin** — real-time component animation driven by live sensor values (fan speed visually mapped to RPM reading, heat-map overlays on thermal components)
- **Fleet-wide analytics** — aggregated dashboards across regions with trend analysis and capacity planning tools
- **Mobile-native app** — a React Native companion app for field engineers, sharing the same backend

---

## About the Name

**Sajag** was chosen deliberately over a generic product name. It is a common Hindi word meaning to be watchful and on guard — qualities that are central to infrastructure monitoring. The name is short, memorable, and speaks directly to the platform's purpose without needing a tagline.

--
