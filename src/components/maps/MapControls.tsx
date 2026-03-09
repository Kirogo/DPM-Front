import React from 'react'

interface MapControlsProps {
    onZoomIn?: () => void
    onZoomOut?: () => void
    onLocateMe?: () => void
    onToggleSatellite?: () => void
    isSatellite?: boolean
}

export const MapControls: React.FC<MapControlsProps> = ({
    onZoomIn,
    onZoomOut,
    onLocateMe,
    onToggleSatellite,
    isSatellite,
}) => {
    return (
        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-[1000]">
            <div className="flex flex-col bg-white rounded-lg shadow-md border border-secondary-200 overflow-hidden">
                <button
                    onClick={onZoomIn}
                    className="p-2 hover:bg-secondary-50 text-secondary-600 border-b border-secondary-100"
                    title="Zoom In"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                <button
                    onClick={onZoomOut}
                    className="p-2 hover:bg-secondary-50 text-secondary-600"
                    title="Zoom Out"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                </button>
            </div>

            <button
                onClick={onLocateMe}
                className="p-2 bg-white rounded-lg shadow-md border border-secondary-200 text-secondary-600 hover:bg-secondary-50"
                title="Find My Location"
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>

            <button
                onClick={onToggleSatellite}
                className={`p-2 bg-white rounded-lg shadow-md border border-secondary-200 text-sm font-medium transition-colors ${isSatellite ? 'bg-primary-600 text-white border-primary-600' : 'text-secondary-600 hover:bg-secondary-50'
                    }`}
                title="Toggle Satellite View"
            >
                {isSatellite ? 'Street' : 'Sat'}
            </button>
        </div>
    )
}
