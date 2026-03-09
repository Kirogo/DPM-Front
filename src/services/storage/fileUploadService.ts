import { GeotaggedPhoto, GeotagData } from '@/types/geotag.types'
import { GeotagExtractor } from './geotagExtractor'
import { v4 as uuidv4 } from 'uuid'

export interface UploadProgress {
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

class FileUploadService {
  private uploadQueue: Map<string, UploadProgress> = new Map()
  private listeners: ((progress: UploadProgress[]) => void)[] = []

  // Create a geotagged photo object
  async createGeotaggedPhoto(file: File): Promise<GeotaggedPhoto> {
    // Extract geotag from image
    let geotag = await GeotagExtractor.extractFromImage(file)
    
    // If no geotag in image, get current location
    if (!geotag && navigator.geolocation) {
      geotag = await this.getCurrentLocation()
    }

    // Create object URL for preview
    const url = URL.createObjectURL(file)

    return {
      id: uuidv4(),
      file,
      url,
      geotag: geotag || {
        latitude: 0,
        longitude: 0,
        timestamp: new Date(),
        accuracy: 0,
      },
      uploadedAt: new Date(),
      thumbnailUrl: url, // In production, generate actual thumbnail
      metadata: {
        deviceModel: navigator.userAgent,
        platform: navigator.platform,
      },
    }
  }

  // Get current location
  private getCurrentLocation(): Promise<GeotagData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: new Date(position.timestamp),
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    })
  }

  // Upload files with progress tracking
  async uploadFiles(
    files: GeotaggedPhoto[],
    onProgress?: (progress: UploadProgress[]) => void
  ): Promise<void> {
    files.forEach(file => {
      this.uploadQueue.set(file.id, {
        id: file.id,
        progress: 0,
        status: 'pending',
      })
    })

    this.notifyListeners()

    const uploadPromises = files.map(async (file) => {
      try {
        // Update status to uploading
        this.updateProgress(file.id, {
          status: 'uploading',
          progress: 0,
        })

        // Simulate upload with progress (replace with actual API call)
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 200))
          this.updateProgress(file.id, { progress: i })
        }

        // Mark as completed
        this.updateProgress(file.id, {
          status: 'completed',
          progress: 100,
        })

      } catch (error) {
        this.updateProgress(file.id, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed',
        })
      }
    })

    await Promise.all(uploadPromises)
  }

  // Update progress for a file
  private updateProgress(id: string, update: Partial<UploadProgress>) {
    const current = this.uploadQueue.get(id)
    if (current) {
      this.uploadQueue.set(id, { ...current, ...update })
      this.notifyListeners()
    }
  }

  // Get all upload progress
  getUploadProgress(): UploadProgress[] {
    return Array.from(this.uploadQueue.values())
  }

  // Subscribe to progress updates
  subscribe(listener: (progress: UploadProgress[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Notify all listeners
  private notifyListeners() {
    const progress = this.getUploadProgress()
    this.listeners.forEach(listener => listener(progress))
  }

  // Clear completed uploads
  clearCompleted() {
    this.uploadQueue.forEach((progress, id) => {
      if (progress.status === 'completed') {
        this.uploadQueue.delete(id)
      }
    })
    this.notifyListeners()
  }

  // Retry failed uploads
  retryFailed() {
    const failed = Array.from(this.uploadQueue.values())
      .filter(p => p.status === 'error')
      .map(p => p.id)
    
    failed.forEach(id => {
      const progress = this.uploadQueue.get(id)
      if (progress) {
        progress.status = 'pending'
        progress.progress = 0
        progress.error = undefined
      }
    })
    
    this.notifyListeners()
  }
}

export default new FileUploadService()