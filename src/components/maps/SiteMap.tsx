import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { PhotoLocationMarker } from './PhotoLocationMarker'
import { GeotaggedPhoto } from '@/types/geotag.types'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'

// Fix for default markers in Leaflet with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface SiteMapProps {
  photos: GeotaggedPhoto[]
  siteLocation?: {
    lat: number
    lng: number
    address: string
  }
  onPhotoClick?: (photo: GeotaggedPhoto) => void
  height?: string
  showControls?: boolean
}

export const SiteMap: React.FC<SiteMapProps> = ({
  photos,
  siteLocation,
  onPhotoClick,
  height = '400px',
  showControls = true,
}) => {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<GeotaggedPhoto | null>(null)
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street')

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return

    // Calculate center
    let center: [number, number] = [0, 0]
    if (siteLocation) {
      center = [siteLocation.lat, siteLocation.lng]
    } else {
      const validPhotos = photos.filter(p => p.geotag?.latitude && p.geotag?.longitude)
      if (validPhotos.length > 0) {
        const avgLat = validPhotos.reduce((sum, p) => sum + p.geotag.latitude, 0) / validPhotos.length
        const avgLng = validPhotos.reduce((sum, p) => sum + p.geotag.longitude, 0) / validPhotos.length
        center = [avgLat, avgLng]
      }
    }

    // Create map
    mapRef.current = L.map(mapContainerRef.current).setView(center, 15)

    // Add tile layer based on map type
    updateTileLayer(mapType)

    return () => {
      mapRef.current?.remove()
    }
  }, [])

  // Update tile layer when map type changes
  const updateTileLayer = (type: 'street' | 'satellite') => {
    if (!mapRef.current) return

    // Remove existing tile layers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current?.removeLayer(layer)
      }
    })

    if (type === 'street') {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapRef.current)
    } else {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }).addTo(mapRef.current)
    }
  }

  // Update markers when photos change
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add site location marker if provided
    if (siteLocation) {
      const siteIcon = L.divIcon({
        className: 'site-marker',
        html: `
          <div class="relative">
            <div class="w-8 h-8 bg-primary-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
              <div class="bg-black text-white text-xs rounded py-1 px-2">
                Site Location
              </div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })

      const marker = L.marker([siteLocation.lat, siteLocation.lng], { icon: siteIcon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div class="text-center">
            <p class="font-medium">Site Location</p>
            <p class="text-xs text-gray-600">${siteLocation.address}</p>
          </div>
        `)

      markersRef.current.push(marker)
    }

    // Add photo markers
    photos.forEach((photo) => {
      if (!photo.geotag?.latitude || !photo.geotag?.longitude) return

      const marker = PhotoLocationMarker({
        photo,
        map: mapRef.current!,
        onClick: () => {
          setSelectedPhoto(photo)
          onPhotoClick?.(photo)
        },
      })

      markersRef.current.push(marker)
    })

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current)
      mapRef.current.fitBounds(group.getBounds().pad(0.1))
    }
  }, [photos, siteLocation, onPhotoClick])

  const handleMapTypeChange = (type: 'street' | 'satellite') => {
    setMapType(type)
    updateTileLayer(type)
  }

  const handleZoomIn = () => {
    mapRef.current?.zoomIn()
  }

  const handleZoomOut = () => {
    mapRef.current?.zoomOut()
  }

  const handleResetView = () => {
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current)
      mapRef.current?.fitBounds(group.getBounds().pad(0.1))
    }
  }

  return (
    <div className="relative" style={{ height }}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" />

      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Card padding="none" className="overflow-hidden">
            <button
              onClick={() => handleMapTypeChange('street')}
              className={`px-3 py-2 text-sm font-medium w-full ${
                mapType === 'street'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-secondary-700 hover:bg-secondary-50'
              }`}
            >
              Street
            </button>
            <button
              onClick={() => handleMapTypeChange('satellite')}
              className={`px-3 py-2 text-sm font-medium w-full border-t ${
                mapType === 'satellite'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-secondary-700 hover:bg-secondary-50'
              }`}
            >
              Satellite
            </button>
          </Card>

          <Card padding="none" className="overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-secondary-50 border-b"
              title="Zoom in"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-secondary-50 border-b"
              title="Zoom out"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <button
              onClick={handleResetView}
              className="p-2 hover:bg-secondary-50"
              title="Reset view"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </Card>
        </div>
      )}

      {/* Photo Info Panel */}
      {selectedPhoto && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80">
          <Card className="bg-white shadow-lg">
            <div className="flex items-start space-x-3">
              <img
                src={selectedPhoto.thumbnailUrl || selectedPhoto.url}
                alt="Selected"
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-secondary-900">
                  Selected Photo
                </p>
                <p className="text-xs text-secondary-500 mt-1">
                  {selectedPhoto.geotag?.latitude.toFixed(6)},{' '}
                  {selectedPhoto.geotag?.longitude.toFixed(6)}
                </p>
                {selectedPhoto.geotag?.accuracy && (
                  <p className="text-xs text-secondary-400">
                    Accuracy: {selectedPhoto.geotag.accuracy.toFixed(1)}m
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-secondary-400 hover:text-secondary-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Photo Count */}
      <div className="absolute bottom-4 left-4">
        <Card padding="sm" className="bg-white/90 backdrop-blur-sm">
          <p className="text-sm text-secondary-700">
            📍 {photos.filter(p => p.geotag?.latitude).length} geotagged photos
          </p>
        </Card>
      </div>
    </div>
  )
}