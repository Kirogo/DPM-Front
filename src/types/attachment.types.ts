export interface Geotag {
    latitude: number
    longitude: number
    altitude?: number
    accuracy?: number
    timestamp: Date
}

export interface GeotaggedPhoto {
    id: string
    file: File
    url: string
    thumbnailUrl?: string
    geotag: Geotag
    uploadedAt: Date
    caption?: string
}

export interface Attachment {
    id: string
    fileName: string
    fileType: string
    fileSize: number
    url: string
    uploadedBy: string
    uploadedAt: string
}
