import React from 'react'
import { CreateReportDto } from '@/types/report.types'
import { Input } from '@/components/common/Input'
import { GeoLocationMap } from './GeoLocationMap'

interface SiteDetailsSectionProps {
    data: Partial<CreateReportDto>
    onChange: (data: Partial<CreateReportDto>) => void
    errors?: Record<string, string>
}

export const SiteDetailsSection: React.FC<SiteDetailsSectionProps> = ({
    data,
    onChange,
    errors = {},
}) => {
    const handleChange = (field: keyof CreateReportDto, value: any) => {
        onChange({ [field]: value })
    }

    return (
        <div className="space-y-4">
            <Input
                label="Report Title *"
                type="text"
                value={data.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter report title"
                error={errors.title}
            />

            <Input
                label="Description"
                type="text"
                value={data.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the visit"
            />

            <Input
                label="Visit Date *"
                type="date"
                value={data.visitDate ? new Date(data.visitDate).toISOString().split('T')[0] : ''}
                onChange={(e) => handleChange('visitDate', new Date(e.target.value))}
                error={errors.visitDate}
            />

            <Input
                label="Site Address *"
                type="text"
                value={data.siteAddress || ''}
                onChange={(e) => handleChange('siteAddress', e.target.value)}
                placeholder="Enter site address"
                error={errors.siteAddress}
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Weather"
                    type="text"
                    value={data.weather || ''}
                    onChange={(e) => handleChange('weather', e.target.value)}
                    placeholder="e.g., Sunny, Cloudy"
                />

                <Input
                    label="Temperature (°C)"
                    type="number"
                    value={data.temperature || ''}
                    onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                    placeholder="e.g., 25"
                />
            </div>

            {/* Geo Location Map */}
            <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Site Location
                </label>
                <GeoLocationMap
                    coordinates={data.siteCoordinates}
                    onLocationSelect={(coords) => handleChange('siteCoordinates', coords)}
                />
            </div>
        </div>
    )
}
