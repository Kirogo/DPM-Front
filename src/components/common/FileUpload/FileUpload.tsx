import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { GeotaggedPhoto } from '@/types/geotag.types'
import { GeotagPreview } from './GeotagPreview'
import fileUploadService from '@/services/storage/fileUploadService'


export interface FileUploadProps {
  onFilesSelected: (files: GeotaggedPhoto[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedFileTypes?: string[]
  existingPhotos?: GeotaggedPhoto[]
  onRemovePhoto?: (photoId: string) => void
  className?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/heic'],
  existingPhotos = [],
  onRemovePhoto,
  className = '',
}) => {
  const [processing, setProcessing] = useState(false)
  const [photos, setPhotos] = useState<GeotaggedPhoto[]>(existingPhotos)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setProcessing(true)

      try {
        const newPhotos: GeotaggedPhoto[] = []

        for (const file of acceptedFiles) {
          if (photos.length + newPhotos.length >= maxFiles) {
            break
          }

          const geotaggedPhoto = await fileUploadService.createGeotaggedPhoto(file)
          newPhotos.push(geotaggedPhoto)
        }

        const updatedPhotos = [...photos, ...newPhotos]
        setPhotos(updatedPhotos)
        onFilesSelected(newPhotos)
      } catch (error) {
        console.error('Error processing files:', error)
      } finally {
        setProcessing(false)
      }
    },
    [photos, maxFiles, onFilesSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {} as Record<string, string[]>),
    maxSize,
    maxFiles: maxFiles - photos.length,
    disabled: photos.length >= maxFiles,
  })

  const handleRemovePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId))
    onRemovePhoto?.(photoId)
  }

  return (
    <div className={className}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-secondary-300 hover:border-primary-400'}
          ${photos.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-secondary-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-sm text-secondary-600">
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <p>
                Drag & drop photos here, or{' '}
                <span className="text-primary-600 font-medium">browse</span>
              </p>
            )}
          </div>
          <p className="text-xs text-secondary-500">
            Max {maxFiles} files, up to {maxSize / 1024 / 1024}MB each
          </p>
        </div>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <GeotagPreview
              key={photo.id}
              photo={photo}
              onRemove={() => handleRemovePhoto(photo.id)}
            />
          ))}
        </div>
      )}

      {/* Processing Indicator */}
      {processing && (
        <div className="mt-4 text-center text-sm text-secondary-600">
          Processing photos...
        </div>
      )}
    </div>
  )
}