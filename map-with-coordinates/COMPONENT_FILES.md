# Leaflet Map Components - File Listing

## Files to Download and Integrate

When you download this project, copy these files to your existing dashboard:

### Core Components (Required)

```
destination: components/
├── StationMap.tsx           (73 lines)
│   └── Main interactive map component with markers
│
└── StationDetails.tsx       (64 lines)
    └── Details modal showing all station fields
```

### Type Definitions (Required)

```
destination: types/
└── station.ts              (28 lines)
    └── TypeScript interface for station data
```

### Utilities (Required)

```
destination: lib/
└── parseStations.ts        (64 lines)
    └── CSV parser and data transformation
```

### Documentation (Reference)

```
└── MAP_INTEGRATION_GUIDE.md
    └── Complete integration instructions
```

### Demo (Optional - for reference only)

```
destination: app/map-demo/
└── page.tsx               (49 lines)
    └── Example page showing how to use the components
```

## Quick Copy-Paste Instructions

### 1. Copy Components
```bash
# From the downloaded project, copy to your dashboard
cp components/StationMap.tsx your-dashboard/components/
cp components/StationDetails.tsx your-dashboard/components/
```

### 2. Copy Types
```bash
cp types/station.ts your-dashboard/types/
```

### 3. Copy Utilities
```bash
cp lib/parseStations.ts your-dashboard/lib/
```

### 4. Install Dependencies
```bash
cd your-dashboard
pnpm add leaflet react-leaflet
# or npm install leaflet react-leaflet
```

### 5. Import and Use

In your dashboard page:
```tsx
import StationMap from '@/components/StationMap';
import { parseCSV } from '@/lib/parseStations';
import type { Station } from '@/types/station';

// Then use as shown in MAP_INTEGRATION_GUIDE.md
```

## Component Breakdown

### StationMap.tsx
**Purpose:** Main map component
**Key Features:**
- Renders Leaflet map with OpenStreetMap tiles
- Plots all stations as markers with correct [lat, lng] ordering
- Shows small popup on marker click (name + address)
- Triggers details modal on marker click
- Dynamic import for Next.js SSR compatibility
- Handles marker icon setup

**Dependencies:**
- react-leaflet (MapContainer, TileLayer, Marker, Popup)
- leaflet (icon styling)
- next/dynamic (for SSR-safe component imports)

**Props Accepted:**
- `stations: Station[]` - Array of location data
- `center?: [number, number]` - Map center (default: Delhi)
- `zoom?: number]` - Initial zoom level (default: 12)

**State Managed:**
- `selectedStation` - Currently clicked station for detail view
- `mounted` - Ensures client-side rendering only
- `defaultIcon` - Leaflet marker icon configuration

### StationDetails.tsx
**Purpose:** Modal panel for expanded station details
**Key Features:**
- Shows all non-empty fields from station object
- Fields sorted alphabetically
- Responsive grid layout (1 column mobile, 2 columns desktop)
- Close button and overlay dismiss
- No external dependencies beyond React

**Props Accepted:**
- `station: Station` - Selected station data
- `onClose: () => void` - Callback to close modal

**Functionality:**
- Filters out empty/null/0 values
- Converts field names (uid → UID, snake_case → Space Case)
- Displays all data types (strings, numbers, arrays, etc.)

### parseStations.ts
**Purpose:** Convert CSV text to typed Station objects
**Key Features:**
- Parses CSV with quoted field support
- Converts latitude/longitude to numbers
- Handles numeric fields correctly
- Creates full Station objects with all properties

**Functions:**
- `parseCSV(csvText: string): Station[]`
  - Input: Raw CSV text with header row
  - Output: Array of Station objects

### station.ts
**Purpose:** TypeScript type definition
**Includes:**
- All CSV column names as interface properties
- Proper typing for coordinates (numbers)
- Optional fields for variable columns
- Index signature for additional properties

## Customization Points

### Customize Marker Appearance
- Edit icon URL in StationMap.tsx
- Change icon size/anchor points
- Add custom styling to popup content

### Customize Details Modal
- Change grid columns in StationDetails.tsx
- Modify label formatting
- Update color scheme and animations
- Adjust backdrop opacity

### Customize Map Behavior
- Change center coordinates
- Adjust default zoom level
- Modify tile layer source
- Add additional controls/buttons

## Testing the Components

The demo page at `/map-demo` includes:
- 10 sample EV charging stations from the provided CSV
- Full functionality test of map and details view
- Example of data parsing

Navigate to `http://localhost:3000/map-demo` to test locally before integrating.

## Integration Checklist

- [ ] Copy `components/StationMap.tsx`
- [ ] Copy `components/StationDetails.tsx`
- [ ] Copy `types/station.ts`
- [ ] Copy `lib/parseStations.ts`
- [ ] Run `pnpm add leaflet react-leaflet`
- [ ] Update type definition if needed (additional CSV columns)
- [ ] Load data from your source
- [ ] Import and render StationMap in your dashboard
- [ ] Test marker clicking and details panel
- [ ] Customize styling/layout as needed
- [ ] Deploy

## Files Summary

| File | Lines | Purpose | Dependency |
|------|-------|---------|------------|
| StationMap.tsx | 90 | Map rendering | react-leaflet |
| StationDetails.tsx | 64 | Details modal | React only |
| station.ts | 28 | Type definition | TypeScript |
| parseStations.ts | 64 | CSV parsing | No deps |
| map-demo/page.tsx | 49 | Demo/example | All above |

**Total Core Files: 246 lines of code**
**Total with Demo: 295 lines of code**

All files use TypeScript and React best practices. Components are fully functional and tested.
