import React from 'react'
import { Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import { GeotaggedPhoto } from '@/types/attachment.types'

interface PhotoLocationMarkerProps {
    photo: GeotaggedPhoto
    onClick?: () => void
}

const customIcon = new Icon({
    iconUrl: '/assets/icons/marker-photo.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
})

export const PhotoLocationMarker: React.FC<PhotoLocationMarkerProps> = ({ photo, onClick }) => {
    return (
        <Marker
            position={[photo.geotag.latitude, photo.geotag.longitude]}
            icon={customIcon}
            eventHandlers={{
                click: () => onClick?.(),
            }}
        >
            <Popup>
                <div className="w-48">
                    <img
                        src={photo.url}
                        alt={photo.caption || 'Site photo'}
                        className="w-full h-32 object-cover rounded-md mb-2"
                    />
                    {photo.caption && <p className="text-sm text-secondary-900 font-medium">{photo.caption}</p>}
                    <p className="text-xs text-secondary-500 mt-1">
                        {new Date(photo.geotag.timestamp).toLocaleString()}
                    </p>
                </div>
            </Popup>
        </Marker>
    )
}
