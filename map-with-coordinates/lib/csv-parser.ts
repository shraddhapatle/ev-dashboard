import { EVStation } from './types'

/**
 * Parses CSV data and converts it to EVStation objects
 * Handles proper latitude/longitude conversion to numbers
 */
export function parseEVStationsCSV(csvContent: string): EVStation[] {
  const lines = csvContent.trim().split('\n')
  if (lines.length < 2) {
    return []
  }

  // Parse header
  const headers = lines[0].split(',').map((h) => h.trim())

  // Parse data rows
  const stations: EVStation[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    // Simple CSV parsing (handles basic cases)
    const values = parseCSVLine(line)

    if (values.length !== headers.length) {
      console.warn(`Row ${i} has ${values.length} columns, expected ${headers.length}`)
    }

    const station: EVStation = {}

    headers.forEach((header, index) => {
      const value = values[index]?.trim() || ''
      const cleanHeader = header.trim()

      // Convert latitude and longitude to numbers
      if (cleanHeader === 'latitude' || cleanHeader === 'longitude') {
        station[cleanHeader] = parseFloat(value) || 0
      } else if (cleanHeader === 'available' || cleanHeader === 'total') {
        // Try to parse numeric fields, keep as string if not numeric
        const num = parseFloat(value)
        station[cleanHeader] = isNaN(num) ? value : num
      } else {
        station[cleanHeader] = value
      }
    })

    // Only add stations with valid coordinates
    if (station.latitude && station.longitude && station.Name) {
      stations.push(station)
    }
  }

  return stations
}

/**
 * Parses a single CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}
