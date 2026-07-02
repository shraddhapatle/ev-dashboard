# Leaflet EV Station Map Component

A reusable React component for displaying EV charging stations on an interactive Leaflet map with detailed popups.

## Files Included

### Components
- **`components/EVStationMap.tsx`** - Main map component (client-side)
- **`components/MarkerPopupContent.tsx`** - Popup content renderer for marker details

### Utilities
- **`lib/types.ts`** - TypeScript interface for EV station data
- **`lib/csv-parser.ts`** - CSV parsing utility for converting CSV to station objects

### Demo
- **`app/map-demo/page.tsx`** - Example implementation showing how to use the map

## Dependencies

```bash
pnpm add leaflet react-leaflet
```

The dependencies are already installed in this project.

## Usage

### Basic Usage

```tsx
import EVStationMap from '@/components/EVStationMap'
import { EVStation } from '@/lib/types'

export default function MyDashboard() {
  const stations: EVStation[] = [
    {
      uid: 'STATION001',
      Name: 'Downtown Charging Hub',
      vendor_name: 'ChargeNet',
      address: '123 Main St, City',
      latitude: 28.6139,
      longitude: 77.2090,
      city: 'Delhi',
      country: 'India',
      open: '00:00:00',
      close: '23:59:59',
      // ... other fields
    },
    // ... more stations
  ]

  return (
    <EVStationMap
      stations={stations}
      center={[28.6139, 77.2090]}
      zoom={12}
      height="500px"
    />
  )
}
```

### With CSV Data

```tsx
import EVStationMap from '@/components/EVStationMap'
import { parseEVStationsCSV } from '@/lib/csv-parser'

export default function MapPage() {
  const csvData = `uid,Name,vendor_name,address,latitude,longitude,...`
  const stations = parseEVStationsCSV(csvData)

  return <EVStationMap stations={stations} />
}
```

## Component Props

### EVStationMap

```typescript
interface EVStationMapProps {
  stations: EVStation[]           // Array of station objects
  center?: [number, number]       // Map center [latitude, longitude] (default: [28.6139, 77.2090])
  zoom?: number                   // Map zoom level (default: 12)
  height?: string                 // Map container height (default: '500px')
}
```

## Data Structure

The `EVStation` type includes all fields from the CSV:

```typescript
interface EVStation {
  uid: string                     // Unique identifier
  Name: string                    // Station name
  vendor_name: string             // Vendor name
  address: string                 // Full address
  latitude: number                // Latitude coordinate
  longitude: number               // Longitude coordinate
  city: string                    // City
  country: string                 // Country
  open: string                    // Opening time (HH:MM:SS)
  close: string                   // Closing time (HH:MM:SS)
  logo_url?: string               // Logo URL
  staff?: string                  // Staff availability
  payment_modes?: string          // Accepted payment methods
  contact_numbers?: string        // Contact numbers
  station_type?: string           // Type of station
  postal_code?: string            // Postal code
  zone?: string                   // Zone/area
  available?: number | string     // Available slots
  capacity?: string               // Total capacity
  cost_per_unit?: string          // Cost per unit
  power_type?: string             // Power type (AC/DC)
  total?: number | string         // Total chargers
  type?: string                   // Charger type
  vehicle_type?: string           // Supported vehicle types
  [key: string]: any              // Additional fields
}
```

## Key Features

✅ **Correct Coordinate Ordering**: Latitude, longitude pairs are properly ordered for Leaflet
✅ **Comprehensive Popups**: All station fields are displayed in scrollable popups
✅ **CSV Parser**: Built-in utility for converting CSV data to station objects
✅ **Responsive Design**: Map scales with container
✅ **Client-Side Rendering**: Marked with 'use client' for Next.js compatibility
✅ **TypeScript Support**: Full type safety with EVStation interface

## Implementation Notes

### Latitude/Longitude Ordering
- **Leaflet expects**: `[latitude, longitude]`
- **CSV columns**: `latitude, longitude` (in that order)
- The parser automatically converts these to numbers

### Popup Display
When you click a marker:
1. A popup opens showing the station name and address
2. All data fields are displayed in a scrollable list
3. Field names are automatically formatted for readability
4. Logo is displayed if available

### Styling
The components use Tailwind CSS classes and are styled minimally to allow easy integration into your dashboard. Customize by:
- Modifying Tailwind classes in the components
- Overriding CSS in your global stylesheet
- Using the `className` prop if you extend the component

## Customization

### Custom Map Styling
Edit `EVStationMap.tsx` to customize the MapContainer:

```tsx
<MapContainer
  center={center}
  zoom={zoom}
  style={{ height, width: '100%' }}
  className="my-custom-class" // Add your own classes
>
```

### Custom Popup Content
Modify `MarkerPopupContent.tsx` to change how station details are displayed:

```tsx
// Reorder fields, add conditional formatting, etc.
```

### Alternative Tile Layers
Replace the TileLayer URL in `EVStationMap.tsx`:

```tsx
// CartoDB
url="https://{s}.basemaps.cartocdn.com/positron/{z}/{x}/{y}{r}.png"

// Dark theme
url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
```

## Testing

The demo page at `/map-demo` shows:
- Map rendering with sample stations
- Marker interactions
- Popup display
- Integration instructions

Visit `http://localhost:3000/map-demo` to test.

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Touch support included

## Troubleshooting

### Markers not appearing
- Verify latitude/longitude values are valid numbers
- Check that stations array is not empty
- Ensure coordinates are in correct order [lat, lng]

### Map not loading
- Ensure 'use client' directive is present in EVStationMap.tsx
- Check browser console for errors
- Verify Leaflet CSS is imported

### Popups showing "[object Object]"
- Check CSV parser is correctly parsing all fields
- Verify station data is properly formatted
- Check console for parsing errors

## Performance Considerations

- Maps with 100+ markers may have slower performance
- Consider using marker clustering for large datasets (not included)
- The CSV parser handles parsing, but large files should be loaded asynchronously

## Next Steps

1. **Copy files to your project** - Download and integrate these components
2. **Load your CSV data** - Use parseEVStationsCSV() or parse manually
3. **Customize styling** - Adjust Tailwind classes to match your dashboard
4. **Add features** - Consider adding marker clustering, filters, or search
