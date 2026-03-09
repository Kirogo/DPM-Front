import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { GeotaggedPhoto } from '@/types/geotag.types'

// Fix for default markers in Leaflet with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface GeoLocationMapProps {
  photos?: GeotaggedPhoto[]
  onPhotoClick?: (photo: GeotaggedPhoto) => void
  center?: [number, number]
  zoom?: number
  coordinates?: { latitude: number; longitude: number }
  onLocationSelect?: (coords: { latitude: number; longitude: number }) => void
}

export const GeoLocationMap: React.FC<GeoLocationMapProps> = ({
  photos = [],
  onPhotoClick,
  center,
  zoom = 13,
  coordinates,
  onLocationSelect,
}) => {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return

    // Calculate center if not provided
    let mapCenter: [number, number] = center || [0, 0]
    if (coordinates) {
      mapCenter = [coordinates.latitude, coordinates.longitude]
    } else if (!center && photos.length > 0) {
      const validPhotos = photos.filter(p => p.geotag?.latitude && p.geotag?.longitude)
      if (validPhotos.length > 0) {
        const avgLat = validPhotos.reduce((sum, p) => sum + p.geotag.latitude, 0) / validPhotos.length
        const avgLng = validPhotos.reduce((sum, p) => sum + p.geotag.longitude, 0) / validPhotos.length
        mapCenter = [avgLat, avgLng]
      }
    }

    // Create map
    mapRef.current = L.map(mapContainerRef.current).setView(mapCenter, zoom)

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current)

    return () => {
      mapRef.current?.remove()
    }
  }, [])

  // Update markers when photos change
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add new markers
    const validPhotos = photos.filter(p => p.geotag?.latitude && p.geotag?.longitude)

    validPhotos.forEach((photo, index) => {
      if (!photo.geotag) return

      // Create custom icon with photo thumbnail
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="relative group">
            <div class="w-10 h-10 rounded-full border-2 border-white shadow-lg overflow-hidden bg-white">
              <img 
                src="${photo.thumbnailUrl || photo.url}" 
                class="w-full h-full object-cover"
                alt="Photo ${index + 1}"
              />
            </div>
            <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
              <div class="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                Photo ${index + 1}
              </div>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
      })

      const marker = L.marker([photo.geotag.latitude, photo.geotag.longitude], { icon })
        .addTo(mapRef.current!)

      // Add popup with photo
      marker.bindPopup(`
        <div class="text-center">
          <img src="${photo.url}" class="w-48 h-32 object-cover rounded mb-2" />
          <p class="text-sm font-medium">${photo.geotag.latitude.toFixed(6)}, ${photo.geotag.longitude.toFixed(6)}</p>
          ${photo.geotag.accuracy ? `<p class="text-xs text-gray-500">Accuracy: ${photo.geotag.accuracy.toFixed(1)}m</p>` : ''}
        </div>
      `)

      if (onPhotoClick) {
        marker.on('click', () => onPhotoClick(photo))
      }

      markersRef.current.push(marker)
    })

    // Add site coordinate marker if present
    if (coordinates) {
      const siteMarker = L.marker([coordinates.latitude, coordinates.longitude], {
        icon: L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      })
        .bindPopup('Site Location')
        .addTo(mapRef.current!)

      markersRef.current.push(siteMarker)
    }

    // Add map click listener for location selection
    const handleClick = (e: L.LeafletMouseEvent) => {
      if (onLocationSelect) {
        onLocationSelect({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng
        })
      }
    }

    if (onLocationSelect) {
      mapRef.current.on('click', handleClick)
    }

    return () => {
      if (onLocationSelect && mapRef.current) {
        mapRef.current.off('click', handleClick)
      }
    }

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current)
      mapRef.current.fitBounds(group.getBounds().pad(0.1))
    }
  }, [photos, onPhotoClick, coordinates, onLocationSelect])

  return <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
}