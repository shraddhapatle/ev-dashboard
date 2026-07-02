# Leaflet Map Components - Usage Examples

Complete code examples for integrating the map components into your dashboard.

## Basic Setup

### Example 1: Simple Full-Page Map

```tsx
'use client';

import { useEffect, useState } from 'react';
import StationMap from '@/components/StationMap';
import { parseCSV } from '@/lib/parseStations';
import type { Station } from '@/types/station';

export default function MapPage() {
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    // Fetch your CSV file
    fetch('/data/stations.csv')
      .then(res => res.text())
      .then(csv => {
        const parsed = parseCSV(csv);
        setStations(parsed);
      });
  }, []);

  return (
    <div className="w-full h-screen">
      <StationMap stations={stations} />
    </div>
  );
}
```

### Example 2: Map in Dashboard Layout

```tsx
'use client';

import { useState, useEffect } from 'react';
import StationMap from '@/components/StationMap';
import { parseCSV } from '@/lib/parseStations';
import type { Station } from '@/types/station';

export default function Dashboard() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStations() {
      try {
        const response = await fetch('/api/stations');
        const data = await response.json();
        setStations(data);
      } catch (err) {
        setError('Failed to load stations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadStations();
  }, []);

  if (loading) {
    return <div className="p-4">Loading map...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      {/* Sidebar */}
      <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Stations</h2>
        <div className="space-y-2">
          {stations.slice(0, 5).map((station) => (
            <div key={station.uid} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
              <p className="font-semibold text-sm">{station.Name}</p>
              <p className="text-xs text-gray-600">{station.address}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
        <StationMap stations={stations} zoom={13} />
      </div>
    </div>
  );
}
```

## Data Loading Examples

### Example 3: Load from Static CSV File

```tsx
const CSV_DATA = `uid,Name,vendor_name,address,latitude,longitude,city,country,open,close,logo_url,staff,payment_modes,contact_numbers,station_type,postal_code,zone,0,available,capacity,cost_per_unit,power_type,total,type,vehicle_type
EESL359,EESL,EESL,"NDMC Parking, Khan Market, New Delhi, 110003",28.600324,77.226883,New Delhi,India,00:00:00,23:59:59,https://ev.delhitransport.in/static/logo/eesl.png,Unstaffed,"E-wallet, cash","[""7906001402""]",charging,110003,central-delhi,,1,15 kW,₹10 per unit,DC,2,DC-001,['4W']`;

const stations = parseCSV(CSV_DATA);
```

### Example 4: Load from Public File

```tsx
useEffect(() => {
  fetch('/data/ev-stations.csv')
    .then(res => res.text())
    .then(csv => {
      const stations = parseCSV(csv);
      setStations(stations);
    })
    .catch(err => console.error('Failed to load CSV:', err));
}, []);
```

### Example 5: Load from API Endpoint

```tsx
useEffect(() => {
  async function loadStations() {
    const response = await fetch('/api/stations');
    const stations: Station[] = await response.json();
    setStations(stations);
  }

  loadStations();
}, []);
```

### Example 6: Load from Database with Query

```tsx
// app/api/stations/route.ts
import { query } from '@/db';
import type { Station } from '@/types/station';

export async function GET() {
  const stations: Station[] = await query(
    'SELECT * FROM ev_stations'
  );
  return Response.json(stations);
}

// In your component:
useEffect(() => {
  fetch('/api/stations')
    .then(res => res.json())
    .then(setStations);
}, []);
```

## Customization Examples

### Example 7: Custom Map Center (Different City)

```tsx
// Mumbai, India
<StationMap 
  stations={stations} 
  center={[19.0760, 72.8777]} 
  zoom={12}
/>

// New York, USA
<StationMap 
  stations={stations} 
  center={[40.7128, -74.0060]} 
  zoom={12}
/>

// London, UK
<StationMap 
  stations={stations} 
  center={[51.5074, -0.1278]} 
  zoom={12}
/>
```

### Example 8: With Search/Filter

```tsx
'use client';

import { useState, useMemo } from 'react';
import StationMap from '@/components/StationMap';
import type { Station } from '@/types/station';

interface StationMapWithSearchProps {
  allStations: Station[];
}

export function StationMapWithSearch({ allStations }: StationMapWithSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStations = useMemo(() => {
    if (!searchTerm) return allStations;
    
    return allStations.filter(station =>
      station.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allStations, searchTerm]);

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search stations..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <StationMap stations={filteredStations} />
      <p className="text-sm text-gray-600">
        Showing {filteredStations.length} of {allStations.length} stations
      </p>
    </div>
  );
}
```

### Example 9: With Category Filtering

```tsx
'use client';

import { useState, useMemo } from 'react';
import StationMap from '@/components/StationMap';
import type { Station } from '@/types/station';

export function StationMapWithFilter({ allStations }: { allStations: Station[] }) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const uniqueCities = useMemo(() => {
    return Array.from(new Set(allStations.map(s => s.city)));
  }, [allStations]);

  const filteredStations = useMemo(() => {
    if (!selectedCity) return allStations;
    return allStations.filter(s => s.city === selectedCity);
  }, [allStations, selectedCity]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCity(null)}
          className={`px-4 py-2 rounded ${
            selectedCity === null 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          All Cities ({allStations.length})
        </button>
        {uniqueCities.map(city => {
          const count = allStations.filter(s => s.city === city).length;
          return (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded ${
                selectedCity === city 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {city} ({count})
            </button>
          );
        })}
      </div>
      <StationMap stations={filteredStations} />
    </div>
  );
}
```

### Example 10: With Station Statistics

```tsx
'use client';

import { useMemo } from 'react';
import StationMap from '@/components/StationMap';
import type { Station } from '@/types/station';

interface StationMapWithStatsProps {
  stations: Station[];
}

export function StationMapWithStats({ stations }: StationMapWithStatsProps) {
  const stats = useMemo(() => {
    return {
      total: stations.length,
      cities: new Set(stations.map(s => s.city)).size,
      dcStations: stations.filter(s => s.power_type === 'DC').length,
      acStations: stations.filter(s => s.power_type === 'AC').length,
    };
  }, [stations]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Total Stations</p>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Cities</p>
          <p className="text-2xl font-bold text-green-600">{stats.cities}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">DC Chargers</p>
          <p className="text-2xl font-bold text-purple-600">{stats.dcStations}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">AC Chargers</p>
          <p className="text-2xl font-bold text-orange-600">{stats.acStations}</p>
        </div>
      </div>
      <StationMap stations={stations} />
    </div>
  );
}
```

## Advanced Examples

### Example 11: Multiple Maps with Different Data

```tsx
'use client';

import StationMap from '@/components/StationMap';
import type { Station } from '@/types/station';

interface MultiMapProps {
  dcStations: Station[];
  acStations: Station[];
}

export function MultiStationMaps({ dcStations, acStations }: MultiMapProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-lg overflow-hidden shadow">
        <h3 className="bg-purple-600 text-white px-4 py-2 font-semibold">
          DC Fast Charging ({dcStations.length})
        </h3>
        <StationMap stations={dcStations} zoom={11} />
      </div>
      <div className="rounded-lg overflow-hidden shadow">
        <h3 className="bg-orange-600 text-white px-4 py-2 font-semibold">
          AC Charging ({acStations.length})
        </h3>
        <StationMap stations={acStations} zoom={11} />
      </div>
    </div>
  );
}
```

### Example 12: With Modal Details Integration

```tsx
'use client';

import { useState } from 'react';
import StationMap from '@/components/StationMap';
import StationDetails from '@/components/StationDetails';
import type { Station } from '@/types/station';

export function StationMapWithModal({ stations }: { stations: Station[] }) {
  const [selectedForModal, setSelectedForModal] = useState<Station | null>(null);

  return (
    <>
      <StationMap stations={stations} />
      
      {selectedForModal && (
        <StationDetails 
          station={selectedForModal} 
          onClose={() => setSelectedForModal(null)}
        />
      )}
    </>
  );
}
```

## TypeScript Usage

### Example 13: Type-Safe Station Creation

```tsx
import type { Station } from '@/types/station';

const stationData: Station = {
  uid: 'EESL359',
  Name: 'EESL',
  vendor_name: 'EESL',
  address: 'NDMC Parking, Khan Market, New Delhi, 110003',
  latitude: 28.600324,
  longitude: 77.226883,
  city: 'New Delhi',
  country: 'India',
  open: '00:00:00',
  close: '23:59:59',
  logo_url: 'https://example.com/logo.png',
  staff: 'Unstaffed',
  payment_modes: 'E-wallet, cash',
  contact_numbers: '7906001402',
  station_type: 'charging',
  postal_code: '110003',
  zone: 'central-delhi',
  available: 1,
  capacity: '15 kW',
  cost_per_unit: '₹10 per unit',
  power_type: 'DC',
  total: 2,
  type: 'DC-001',
  vehicle_type: "['4W']",
};
```

### Example 14: Custom Hook for Station Management

```tsx
'use client';

import { useState, useEffect } from 'react';
import type { Station } from '@/types/station';

export function useStations(url: string) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setStations(Array.isArray(data) ? data : data.stations);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        setStations([]);
      })
      .finally(() => setLoading(false));
  }, [url]);

  return { stations, loading, error };
}

// Usage:
const { stations, loading, error } = useStations('/api/stations');
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
return <StationMap stations={stations} />;
```

## Integration Patterns

### Pattern 1: Page Component
```tsx
// app/stations/page.tsx
import StationMap from '@/components/StationMap';

export default async function StationsPage() {
  const stations = await fetch('your-data-source').then(r => r.json());
  return <StationMap stations={stations} />;
}
```

### Pattern 2: Server Component with Client Wrapper
```tsx
// app/stations/page.tsx
import StationMapClient from '@/components/StationMapClient';
import { getStations } from '@/db';

export default async function StationsPage() {
  const stations = await getStations();
  return <StationMapClient stations={stations} />;
}

// components/StationMapClient.tsx
'use client';
import StationMap from '@/components/StationMap';
import type { Station } from '@/types/station';

export default function StationMapClient({ stations }: { stations: Station[] }) {
  return <StationMap stations={stations} />;
}
```

### Pattern 3: Layout Integration
```tsx
// app/dashboard/layout.tsx
import StationMapPanel from '@/components/StationMapPanel';
import { getStations } from '@/db';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const stations = await getStations();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-1">{children}</div>
      <div className="lg:col-span-3">
        <StationMapPanel stations={stations} />
      </div>
    </div>
  );
}
```

---

**All examples use:**
- 'use client' for client components (required for interactive features)
- TypeScript with proper Station type
- Standard Next.js patterns
- Tailwind CSS for styling
- Error handling and loading states

Start with **Example 1** for basic setup, then explore others based on your needs!
