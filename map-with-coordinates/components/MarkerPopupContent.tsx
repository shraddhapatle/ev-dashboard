'use client'

import { EVStation } from '@/lib/types'

interface MarkerPopupContentProps {
  station: EVStation
}

export default function MarkerPopupContent({ station }: MarkerPopupContentProps) {
  // Get all fields from the station object
  const fields = Object.entries(station).filter(
    ([value]) => value !== undefined && value !== null && value !== ''
  )

  return (
    <div className="ev-station-details">
      <div className="mb-3 border-b pb-2">
        <h3 className="font-bold text-lg text-gray-900">{station.Name}</h3>
        <p className="text-sm text-gray-600">{station.address}</p>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto text-sm">
        {fields.map(([key, value]) => {
          // Format the key for display
          const displayKey = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim()

          // Format the value for display
          let displayValue = value
          if (Array.isArray(value)) {
            displayValue = value.join(', ')
          } else if (typeof value === 'object') {
            displayValue = JSON.stringify(value)
          }

          return (
            <div key={key} className="grid grid-cols-2 gap-2">
              <dt className="font-semibold text-gray-700">{displayKey}:</dt>
              <dd className="text-gray-600 break-words">{String(displayValue)}</dd>
            </div>
          )
        })}
      </div>

      {station.logo_url && (
        <div className="mt-3 pt-3 border-t">
          <img
            src={station.logo_url}
            alt={station.vendor_name}
            className="h-12 w-12 object-contain"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}
    </div>
  )
}
