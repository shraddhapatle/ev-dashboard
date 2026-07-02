/**
 * This is an example component showing how to integrate the EVStationMap
 * into your existing dashboard with full CSV data loading.
 * 
 * You can:
 * 1. Copy this file into your components directory
 * 2. Modify the CSV_DATA constant to load from your data source
 * 3. Pass it to your dashboard layout
 */

'use client'

import { useMemo } from 'react'
import EVStationMap from './EVStationMap'
import { parseEVStationsCSV } from '@/lib/csv-parser'

interface MapIntegrationExampleProps {
  csvData?: string
  mapHeight?: string
  mapZoom?: number
  mapCenter?: [number, number]
  showInfo?: boolean
}

/**
 * Example component that loads CSV data and renders the map
 * Replace csvData prop value with your actual data source
 */
export default function MapIntegrationExample({
  csvData,
  mapHeight = '600px',
  mapZoom = 13,
  mapCenter = [28.6139, 77.2090],
  showInfo = true,
}: MapIntegrationExampleProps) {
  // Parse CSV data to stations
  const stations = useMemo(() => {
    if (!csvData) return []
    return parseEVStationsCSV(csvData)
  }, [csvData])

  if (!csvData || stations.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
        No station data provided. Pass CSV data via the csvData prop.
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {showInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Map Info</h3>
          <p className="text-sm text-blue-800">
            Displaying {stations.length} charging stations. Click any marker to view
            complete details.
          </p>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden shadow-lg">
        <EVStationMap
          stations={stations}
          center={mapCenter}
          zoom={mapZoom}
          height={mapHeight}
        />
      </div>
    </div>
  )
}

/**
 * HOW TO USE THIS COMPONENT IN YOUR DASHBOARD:
 * 
 * 1. Import the component:
 *    import MapIntegrationExample from '@/components/MapIntegrationExample'
 * 
 * 2. Load your CSV data from a file, API, or database:
 *    const csvData = await fetch('/api/stations').then(r => r.text())
 * 
 * 3. Render the component:
 *    <MapIntegrationExample 
 *      csvData={csvData}
 *      mapHeight="500px"
 *      mapZoom={12}
 *    />
 * 
 * 4. (Optional) Load data asynchronously:
 * 
 *    'use client'
 *    import { useEffect, useState } from 'react'
 *    import MapIntegrationExample from '@/components/MapIntegrationExample'
 *    
 *    export default function Dashboard() {
 *      const [csvData, setCsvData] = useState('')
 *      const [loading, setLoading] = useState(true)
 *      
 *      useEffect(() => {
 *        fetch('/api/ev-stations')
 *          .then(r => r.text())
 *          .then(data => {
 *            setCsvData(data)
 *            setLoading(false)
 *          })
 *          .catch(err => {
 *            console.error('Failed to load stations:', err)
 *            setLoading(false)
 *          })
 *      }, [])
 *      
 *      if (loading) return <div>Loading map...</div>
 *      
 *      return (
 *        <div className="p-6">
 *          <h1 className="text-3xl font-bold mb-6">EV Station Network</h1>
 *          <MapIntegrationExample csvData={csvData} />
 *        </div>
 *      )
 *    }
 */
