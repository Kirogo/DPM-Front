import exifr from 'exifr'
import { GeotagData } from '@/types/geotag.types'

export const extractGeotag = async (file: File): Promise<GeotagData | null> => {
    try {
        const data = await exifr.parse(file, { gps: true, exif: true })

        if (!data || !data.latitude || !data.longitude) {
            return null
        }

        const exifData = data as any

        return {
            latitude: data.latitude,
            longitude: data.longitude,
            altitude: data.altitude,
            timestamp: exifData.DateTimeOriginal ? new Date(exifData.DateTimeOriginal) : new Date(),
            accuracy: exifData.GPSHPositioningError,
        }
    } catch (error) {
        console.error('Failed to extract GPS data:', error)
        return null
    }
}
