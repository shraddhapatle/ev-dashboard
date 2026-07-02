# Leaflet Map Components - Integration Guide

This package contains reusable React components for displaying location-based data on an interactive Leaflet map with full details view on marker click.

## Features

- ✅ Interactive Leaflet map with OpenStreetMap tiles
- ✅ Multiple marker plotting with correct lat/lng ordering
- ✅ Click-to-view detailed information panel
- ✅ All CSV columns visible in expanded detail view
- ✅ Responsive design (works on mobile & desktop)
- ✅ Dynamic imports for SSR compatibility with Next.js

## Components Included

### 1. StationMap Component
**File:** `components/StationMap.tsx`

Main map component that renders all stations as markers.

**Props:**
```typescript
interface StationMapProps {
  stations: Station[];
  center?: [number, number];    // Default: Delhi center
  zoom?: number;                // Default: 12
}
```

**Usage:**
```tsx
import StationMap from '@/components/StationMap';
import type { Station } from '@/types/station';

const stations: Station[] = [/* your data */];

export default function MyDashboard() {
  return <StationMap stations={stations} zoom={13} />;
}
```

### 2. StationDetails Component
**File:** `components/StationDetails.tsx`

Modal panel that displays all fields for a selected station. Auto-filters empty values.

**Props:**
```typescript
interface StationDetailsProps {
  station: Station;
  onClose: () => void;
}
```

### 3. Type Definition
**File:** `types/station.ts`

TypeScript interface matching your CSV structure.

**CSV Columns Supported:**
- uid, Name, vendor_name, address
- latitude, longitude, city, country
- open, close, logo_url, staff
- payment_modes, contact_numbers, station_type
- postal_code, zone, available, capacity
- cost_per_unit, power_type, total, type, vehicle_type

### 4. CSV Parser Utility
**File:** `lib/parseStations.ts`

Converts CSV text to typed Station objects. Handles quoted fields and numeric parsing.

**Usage:**
```tsx
import { parseCSV } from '@/lib/parseStations';

const csvData = `uid,Name,...\nESL359,EESL,...`;
const stations = parseCSV(csvData);
```

## Integration Steps

### Step 1: Copy Components to Your Project

Copy these files to your project:
```
components/
  ├── StationMap.tsx
  └── StationDetails.tsx

types/
  └── station.ts

lib/
  └── parseStations.ts
```

### Step 2: Install Dependencies

Ensure you have Leaflet installed:
```bash
npm install leaflet react-leaflet
# or
pnpm add leaflet react-leaflet
```

### Step 3: Import and Use

In your dashboard page or component:

```tsx
'use client';

import { useEffect, useState } from 'react';
import StationMap from '@/components/StationMap';
import { parseCSV } from '@/lib/parseStations';
import type { Station } from '@/types/station';

export default function Dashboard() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch your CSV or load stations from API
    fetch('/api/stations')
      .then(res => res.text())
      .then(csv => {
        const parsed = parseCSV(csv);
        setStations(parsed);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="w-full h-screen">
      <StationMap stations={stations} />
    </div>
  );
}
```

### Step 4: Load Data from Your Source

**Option A: From CSV File**
```tsx
const response = await fetch('/your-file.csv');
const csvText = await response.text();
const stations = parseCSV(csvText);
```

**Option B: From API**
```tsx
const response = await fetch('/api/stations');
const stations = await response.json();
```

**Option C: From Database**
```tsx
// Your existing database query
const stations = await db.query('SELECT * FROM stations');
```

## How It Works

### Marker Click Behavior
1. User clicks a marker on the map
2. `eventHandlers` triggers `setSelectedStation(station)`
3. StationDetails modal appears showing all station fields
4. Close button sets selectedStation back to null, hiding the modal

### Data Flow
```
CSV/API Data
    ↓
parseCSV() or fetch
    ↓
Station[] array
    ↓
StationMap component
    ↓
Map Container + TileLayer + Markers
```

### Coordinate System
- **Latitude (X-axis):** North-South position
- **Longitude (Y-axis):** East-West position
- **Ordering:** [latitude, longitude] for react-leaflet

The parser correctly extracts these from your CSV columns.

## Customization

### Change Map Center
```tsx
<StationMap 
  stations={stations} 
  center={[28.6139, 77.2090]}  // Any [lat, lng]
  zoom={14}
/>
```

### Change Map Height
Edit `StationMap.tsx`:
```tsx
style={{ minHeight: '800px' }}  // Adjust as needed
```

### Customize Marker Popup
Edit the `<Popup>` content in `StationMap.tsx`:
```tsx
<Popup>
  <div className="font-bold">{station.Name}</div>
  <div>{station.city}</div>
  <div>{station.address}</div>
</Popup>
```

### Customize Details Panel Layout
Edit `StationDetails.tsx` to change:
- Grid columns: `grid-cols-1 sm:grid-cols-2` 
- Field labels formatting
- Color scheme
- Modal backdrop and animations

### Add Custom Marker Icons
```tsx
const customIcon = L.icon({
  iconUrl: 'path/to/custom-icon.png',
  iconSize: [32, 48],
  // ... other properties
});

// In StationMap component, replace defaultIcon with customIcon
```

## Performance Notes

- **Dynamic Imports:** Leaflet is dynamically imported for Next.js SSR compatibility
- **Lazy Loading:** Map only renders in browser, not on server
- **Large Datasets:** For 1000+ markers, consider adding:
  - Marker clustering (use leaflet-markercluster)
  - Viewport-based filtering
  - Pagination or search

## Troubleshooting

### Map Not Showing
- Check that Leaflet CSS is imported: `import 'leaflet/dist/leaflet.css'`
- Ensure component has a height: `style={{ minHeight: '600px' }}`
- Verify stations array is not empty

### Markers Not Clickable
- Check that latitude/longitude are numbers (not strings)
- Verify coordinate range is realistic (lat: -90 to 90, lng: -180 to 180)

### Details Panel Not Opening
- Check browser console for errors
- Verify selectedStation state is updating
- Check that StationDetails component is rendered (conditional in JSX)

### Wrong Marker Positions
- Verify lat/lng ordering: should be [latitude, longitude]
- Check parseCSV correctly identifies latitude/longitude columns
- Validate CSV data has valid numeric coordinates

## File Structure Reference

```
project/
├── components/
│   ├── StationMap.tsx          # Main map component
│   └── StationDetails.tsx       # Details modal component
├── types/
│   └── station.ts              # TypeScript type definition
├── lib/
│   └── parseStations.ts        # CSV parser utility
└── app/
    └── map-demo/
        └── page.tsx            # Demo page with sample data
```

## Demo Page

A demo page is included at `/map-demo` showing:
- Full working map with 10 sample EV charging stations
- Sample CSV parsing
- Integration example

Navigate to `http://localhost:3000/map-demo` to see it in action.

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with touch events

## License

These components are provided as-is for integration into your project.

## Next Steps

1. Copy the components to your project
2. Install dependencies: `pnpm add leaflet react-leaflet`
3. Update `/types/station.ts` if your CSV has additional columns
4. Load your actual data and pass to `<StationMap />`
5. Customize styling and behavior as needed
