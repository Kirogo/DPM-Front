import { useState, useEffect, useCallback } from 'react'
import { GeotagData } from '@/types/geotag.types'

interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  watch?: boolean
}

interface GeolocationState {
  location: GeotagData | null
  error: GeolocationPositionError | null
  isLoading: boolean
  watchId?: number
}

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = false,
  } = options

  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: true,
  })

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: {
          code: 0,
          message: 'Geolocation not supported',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        },
        isLoading: false,
      }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: new Date(position.timestamp),
          },
          error: null,
          isLoading: false,
        })
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error,
          isLoading: false,
        }))
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    )
  }, [enableHighAccuracy, timeout, maximumAge])

  useEffect(() => {
    if (!watch) {
      getCurrentPosition()
      return
    }

    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: {
          code: 0,
          message: 'Geolocation not supported',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        },
        isLoading: false,
      }))
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: new Date(position.timestamp),
          },
          error: null,
          isLoading: false,
          watchId,
        })
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error,
          isLoading: false,
          watchId,
        }))
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [watch, enableHighAccuracy, timeout, maximumAge, getCurrentPosition])

  const requestPermission = useCallback(async () => {
    if (!navigator.permissions || !navigator.permissions.query) {
      return 'prompt'
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' })
      return result.state
    } catch (error) {
      console.error('Error checking permission:', error)
      return 'prompt'
    }
  }, [])

  return {
    ...state,
    getCurrentPosition,
    requestPermission,
  }
}