import type { Station } from '@/types/station';

export function parseCSV(csvText: string): Station[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Parse data rows
  const stations: Station[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Handle CSV parsing with quoted fields
    const values: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = line[j + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          j++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    // Create station object
    const station: Station = {} as Station;
    headers.forEach((header, index) => {
      let value: any = values[index] || '';
      
      // Parse latitude and longitude as numbers
      if (header === 'latitude' || header === 'longitude') {
        value = parseFloat(value) || 0;
      }
      // Parse numeric fields
      else if (['available', 'total'].includes(header)) {
        value = value ? (isNaN(Number(value)) ? value : Number(value)) : '';
      }
      
      station[header] = value;
    });

    stations.push(station);
  }

  return stations;
}
