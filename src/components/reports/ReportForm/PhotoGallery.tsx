import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface PhotoGalleryProps {
    photos: File[]
    onPhotosAdd?: (files: File[], geotags: (any | null)[]) => void
    onChange: (photos: File[]) => void
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, onChange, onPhotosAdd }) => {
    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            let geotags: (any | null)[] = new Array(acceptedFiles.length).fill(null)

            try {
                if ('geolocation' in navigator) {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: true,
                            timeout: 5000,
                            maximumAge: 0
                        })
                    })

                    geotags = acceptedFiles.map(() => ({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date(position.timestamp)
                    }))
                }
            } catch (error) {
                console.warn('Geolocation failed or denied:', error)
            }

            if (onPhotosAdd) {
                onPhotosAdd(acceptedFiles, geotags)
            }
            onChange([...photos, ...acceptedFiles])
        },
        [photos, onChange, onPhotosAdd]
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
        },
        multiple: true,
    })

    const removePhoto = (index: number) => {
        onChange(photos.filter((_, i) => i !== index))
    }

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-300 hover:border-primary-400'
                    }`}
            >
                <input {...getInputProps()} />
                <svg
                    className="mx-auto h-12 w-12 text-secondary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
                <p className="mt-2 text-sm text-secondary-600">
                    {isDragActive
                        ? 'Drop the photos here...'
                        : 'Drag and drop photos here, or click to select'}
                </p>
                <p className="mt-1 text-xs text-secondary-500">
                    Supports: JPEG, PNG, GIF, WebP
                </p>
            </div>

            {/* Photo Grid */}
            {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={URL.createObjectURL(photo)}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute top-2 right-2 bg-error text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                            <p className="mt-1 text-xs text-secondary-600 truncate">{photo.name}</p>
                        </div>
                    ))}
                </div>
            )}

            {photos.length > 0 && (
                <p className="text-sm text-secondary-600">
                    {photos.length} photo{photos.length !== 1 ? 's' : ''} selected
                </p>
            )}
        </div>
    )
}
