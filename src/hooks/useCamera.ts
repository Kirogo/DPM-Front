import { useState, useCallback, useRef } from 'react'
import { GeotaggedPhoto } from '@/types/geotag.types'
import fileUploadService from '@/services/storage/fileUploadService'
import toast from 'react-hot-toast'

interface CameraOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  captureMultiple?: boolean
  maxPhotos?: number
}

export const useCamera = (options: CameraOptions = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    captureMultiple = false,
    maxPhotos = 10,
  } = options

  const [photos, setPhotos] = useState<GeotaggedPhoto[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const takePhoto = useCallback(async () => {
    setIsCapturing(true)
    setError(null)

    try {
      // Create hidden file input for camera
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.capture = 'environment' // Use rear camera
      input.multiple = captureMultiple

      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files
        if (!files || files.length === 0) {
          setIsCapturing(false)
          return
        }

        try {
          // Check photo limit
          if (!captureMultiple && files.length > 1) {
            toast.error('Only one photo can be captured at a time')
            return
          }

          if (photos.length + files.length > maxPhotos) {
            toast.error(`Maximum ${maxPhotos} photos allowed`)
            return
          }

          const newPhotos: GeotaggedPhoto[] = []

          for (let i = 0; i < files.length; i++) {
            const file = files[i]
            
            // Compress image if needed
            const processedFile = await compressImage(file)
            
            // Create geotagged photo
            const geotaggedPhoto = await fileUploadService.createGeotaggedPhoto(processedFile)
            newPhotos.push(geotaggedPhoto)
          }

          setPhotos(prev => [...prev, ...newPhotos])
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to process photo')
          toast.error('Failed to process photo')
        } finally {
          setIsCapturing(false)
        }
      }

      input.click()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access camera')
      setIsCapturing(false)
      toast.error('Failed to access camera')
    }
  }, [captureMultiple, maxPhotos, photos.length])

  const compressImage = useCallback(
    async (file: File): Promise<File> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (e) => {
          const img = new Image()
          img.src = e.target?.result as string
          img.onload = () => {
            const canvas = document.createElement('canvas')
            let width = img.width
            let height = img.height

            // Calculate new dimensions
            if (width > height) {
              if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width)
                width = maxWidth
              }
            } else {
              if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height)
                height = maxHeight
              }
            }

            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx?.drawImage(img, 0, 0, width, height)

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  })
                  resolve(compressedFile)
                } else {
                  reject(new Error('Failed to compress image'))
                }
              },
              'image/jpeg',
              quality
            )
          }
        }
        reader.onerror = reject
      })
    },
    [maxWidth, maxHeight, quality]
  )

  const selectFromGallery = useCallback(async () => {
    setIsCapturing(true)
    setError(null)

    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.multiple = captureMultiple

      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files
        if (!files || files.length === 0) {
          setIsCapturing(false)
          return
        }

        try {
          if (photos.length + files.length > maxPhotos) {
            toast.error(`Maximum ${maxPhotos} photos allowed`)
            return
          }

          const newPhotos: GeotaggedPhoto[] = []

          for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const geotaggedPhoto = await fileUploadService.createGeotaggedPhoto(file)
            newPhotos.push(geotaggedPhoto)
          }

          setPhotos(prev => [...prev, ...newPhotos])
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to process photo')
        } finally {
          setIsCapturing(false)
        }
      }

      input.click()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select photos')
      setIsCapturing(false)
    }
  }, [captureMultiple, maxPhotos, photos.length])

  const removePhoto = useCallback((photoId: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === photoId)
      if (photo) {
        URL.revokeObjectURL(photo.url) // Clean up object URL
      }
      return prev.filter(p => p.id !== photoId)
    })
  }, [])

  const clearPhotos = useCallback(() => {
    photos.forEach(photo => URL.revokeObjectURL(photo.url))
    setPhotos([])
  }, [photos])

  const retakePhoto = useCallback(
    async (photoId: string) => {
      removePhoto(photoId)
      await takePhoto()
    },
    [removePhoto, takePhoto]
  )

  return {
    photos,
    isCapturing,
    error,
    takePhoto,
    selectFromGallery,
    removePhoto,
    clearPhotos,
    retakePhoto,
    hasPhotos: photos.length > 0,
    photoCount: photos.length,
  }
}