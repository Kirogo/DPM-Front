export const validateFileSize = (file: File, maxSizeMB: number) => {
    const maxSize = maxSizeMB * 1024 * 1024
    return file.size <= maxSize
}

export const validateFileType = (file: File, allowedTypes: string[]) => {
    return allowedTypes.some(type => {
        if (type.endsWith('/*')) {
            const baseType = type.split('/')[0]
            return file.type.startsWith(`${baseType}/`)
        }
        return file.type === type
    })
}

export const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || ''
}
