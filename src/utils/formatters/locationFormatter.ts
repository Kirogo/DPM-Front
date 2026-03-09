export const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

export const formatAddress = (address: string) => {
    return address || 'No address provided'
}

export const getGoogleMapsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}
