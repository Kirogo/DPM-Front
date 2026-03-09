import React, { useState } from 'react'
import { GeotaggedPhoto } from '@/types/geotag.types'
import { GeotagExtractor } from '@/services/storage/geotagExtractor'
import { formatCoordinates } from '@/utils/formatters/locationFormatter'

export interface GeotagPreviewProps {
  photo: GeotaggedPhoto
  onRemove?: () => void
  onClick?: () => void
  showDetails?: boolean
}

export const GeotagPreview: React.FC<GeotagPreviewProps> = ({
  photo,
  onRemove,
  onClick,
  showDetails = false,
}) => {
  const [showMap, setShowMap] = useState(false)
  const validation = GeotagExtractor.validateGeotag(photo.geotag)

  const getAccuracyColor = () => {
    switch (validation.accuracy) {
      case 'high':
        return 'text-success'
      case 'medium':
        return 'text-warning'
      case 'low':
        return 'text-error'
      default:
        return 'text-secondary-400'
    }
  }

  const accuracyIcon = {
    high: '🟢',
    medium: '🟡',
    low: '🔴',
    unknown: '⚪',
  }

  return (
    <div className="relative group rounded-lg overflow-hidden border border-secondary-200">
      {/* Photo */}
      <div
        className="aspect-w-1 aspect-h-1 bg-secondary-100 cursor-pointer"
        onClick={onClick}
      >
        <img
          src={photo.url}
          alt="Preview"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Geotag Indicator */}
      <div
        className={`
          absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium
          bg-white/90 backdrop-blur-sm shadow-sm flex items-center space-x-1
          ${getAccuracyColor()}
        `}
        title={`Accuracy: ${validation.accuracy}`}
      >
        <span>{accuracyIcon[validation.accuracy]}</span>
        <span>{formatCoordinates(photo.geotag.latitude, photo.geotag.longitude)}</span>
      </div>

      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="
            absolute top-2 right-2 p-1 rounded-full bg-white/90 
            text-secondary-600 hover:text-error transition-colors
            opacity-0 group-hover:opacity-100 focus:opacity-100
          "
          aria-label="Remove photo"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}

      {/* Details Toggle */}
      {showDetails && (
        <button
          onClick={() => setShowMap(!showMap)}
          className="
            absolute bottom-2 right-2 p-1 rounded-full bg-white/90 
            text-primary-600 hover:text-primary-700 transition-colors
            opacity-0 group-hover:opacity-100 focus:opacity-100
          "
          title="Show details"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}

      {/* Details Panel */}
      {showMap && showDetails && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm p-3 overflow-y-auto">
          <div className="text-xs space-y-2">
            <div>
              <span className="font-medium">Latitude:</span>{' '}
              {photo.geotag.latitude.toFixed(6)}
            </div>
            <div>
              <span className="font-medium">Longitude:</span>{' '}
              {photo.geotag.longitude.toFixed(6)}
            </div>
            {photo.geotag.altitude && (
              <div>
                <span className="font-medium">Altitude:</span>{' '}
                {photo.geotag.altitude.toFixed(1)}m
              </div>
            )}
            <div>
              <span className="font-medium">Accuracy:</span>{' '}
              {photo.geotag.accuracy?.toFixed(1)}m
            </div>
            <div>
              <span className="font-medium">Timestamp:</span>{' '}
              {photo.geotag.timestamp.toLocaleString()}
            </div>
            {validation.warnings && (
              <div className="text-warning">
                <span className="font-medium">Warnings:</span>
                <ul className="list-disc pl-4 mt-1">
                  {validation.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
