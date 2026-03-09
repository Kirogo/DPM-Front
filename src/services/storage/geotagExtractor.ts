import * as exifr from 'exifr'
import { GeotagData } from '@/types/geotag.types'

export class GeotagExtractor {
  // Extract geotag from image file
  static async extractFromImage(file: File): Promise<GeotagData | null> {
    try {
      const arrayBuffer = await file.arrayBuffer()

      // Extract GPS data from EXIF
      const gps = await exifr.gps(arrayBuffer)

      if (gps && gps.latitude !== undefined && gps.longitude !== undefined) {
        const gpsAny = gps as any
        return {
          latitude: gps.latitude,
          longitude: gps.longitude,
          altitude: gpsAny.altitude,
          timestamp: gpsAny.DateTimeOriginal || new Date(file.lastModified),
          accuracy: gpsAny.GPSHPositioningError,
        }
      }

      return null
    } catch (error) {
      console.error('Error extracting geotag:', error)
      return null
    }
  }

  // Extract all metadata from image
  static async extractAllMetadata(file: File): Promise<any> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const metadata = await exifr.parse(arrayBuffer, {
        tiff: true,
        exif: true,
        gps: true,
        interop: true,
        xmp: true,
        icc: true,
        iptc: true,
        jfif: true,
        ihdr: true,
      })

      return metadata
    } catch (error) {
      console.error('Error extracting metadata:', error)
      return null
    }
  }

  // Convert EXIF GPS coordinates to decimal
  static convertDMSToDecimal(degrees: number, minutes: number, seconds: number, ref: string): number {
    let decimal = degrees + minutes / 60 + seconds / 3600

    if (ref === 'S' || ref === 'W') {
      decimal = -decimal
    }

    return decimal
  }

  // Validate geotag accuracy
  static validateGeotag(geotag: GeotagData): {
    isValid: boolean
    accuracy: 'high' | 'medium' | 'low' | 'unknown'
    warnings?: string[]
  } {
    const warnings: string[] = []

    // Check if coordinates exist
    if (!geotag.latitude || !geotag.longitude) {
      return {
        isValid: false,
        accuracy: 'unknown',
        warnings: ['No coordinates found'],
      }
    }

    // Validate coordinate ranges
    if (geotag.latitude < -90 || geotag.latitude > 90) {
      warnings.push('Invalid latitude')
    }

    if (geotag.longitude < -180 || geotag.longitude > 180) {
      warnings.push('Invalid longitude')
    }

    // Check accuracy
    let accuracy: 'high' | 'medium' | 'low' | 'unknown' = 'unknown'

    if (geotag.accuracy !== undefined) {
      if (geotag.accuracy <= 10) {
        accuracy = 'high'
      } else if (geotag.accuracy <= 50) {
        accuracy = 'medium'
      } else {
        accuracy = 'low'
        warnings.push('Low GPS accuracy')
      }
    }

    return {
      isValid: warnings.length === 0,
      accuracy,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }

  // Calculate distance between two geotags (in meters)
  static calculateDistance(geotag1: GeotagData, geotag2: GeotagData): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (geotag1.latitude * Math.PI) / 180
    const φ2 = (geotag2.latitude * Math.PI) / 180
    const Δφ = ((geotag2.latitude - geotag1.latitude) * Math.PI) / 180
    const Δλ = ((geotag2.longitude - geotag1.longitude) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  // Group photos by location proximity
  static groupByLocation(photos: { id: string; geotag: GeotagData }[], maxDistance: number = 100): Map<string, string[]> {
    const groups = new Map<string, string[]>()
    const processed = new Set<string>()

    photos.forEach((photo1, i) => {
      if (processed.has(photo1.id)) return

      const group: string[] = [photo1.id]
      processed.add(photo1.id)

      photos.slice(i + 1).forEach((photo2) => {
        if (!processed.has(photo2.id)) {
          const distance = this.calculateDistance(photo1.geotag, photo2.geotag)
          if (distance <= maxDistance) {
            group.push(photo2.id)
            processed.add(photo2.id)
          }
        }
      })

      groups.set(`group-${groups.size + 1}`, group)
    })

    return groups
  }
}