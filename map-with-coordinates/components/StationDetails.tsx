'use client';

import { X } from 'lucide-react';
import type { Station } from '@/types/station';

interface StationDetailsProps {
  station: Station;
  onClose: () => void;
}

export default function StationDetails({ station, onClose }: StationDetailsProps) {
  // Get all non-empty fields from the station object
  const fields = Object.entries(station)
    .filter(([, value]) => value !== null && value !== undefined && value !== '' && value !== '0')
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{station.Name}</h2>
            <p className="text-sm text-gray-600 mt-1">{station.uid}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {fields.map(([key, value]) => (
              <div key={key}>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {key.replace(/_/g, ' ')}
                </label>
                <p className="text-sm text-gray-900 mt-1 break-words">
                  {typeof value === 'string' ? value : JSON.stringify(value)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
