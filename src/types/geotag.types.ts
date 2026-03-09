export interface GeotagData {
  latitude: number
  longitude: number
  altitude?: number
  accuracy?: number
  altitudeAccuracy?: number
  heading?: number
  speed?: number
  timestamp: Date
  address?: Address
}

export interface GeotagMetadata {
  deviceId?: string
  deviceModel?: string
  platform?: string
  appVersion?: string
  batteryLevel?: number
  isMocked?: boolean
}

export interface GeotaggedPhoto {
  id: string
  file: File
  url: string
  geotag: GeotagData
  metadata?: GeotagMetadata
  uploadedAt: Date
  thumbnailUrl?: string
}

export interface Address {
  street?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  formattedAddress: string
  placeId?: string
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface MapMarker {
  id: string
  position: [number, number]
  title?: string
  description?: string
  photoId?: string
  icon?: 'photo' | 'report' | 'site' | 'user'
  color?: string
}

export interface GeotagFilter {
  startDate?: Date
  endDate?: Date
  bounds?: MapBounds
  radius?: number
  center?: [number, number]
  reportId?: string
  userId?: string
}

export type GeotagAccuracy = 'high' | 'medium' | 'low' | 'unknown'

export interface GeotagValidationResult {
  isValid: boolean
  accuracy?: GeotagAccuracy
  errors?: string[]
  warnings?: string[]
}