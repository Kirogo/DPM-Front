import React, { useState } from 'react'
import { ReportFilter, ReportStatus } from '@/types/report.types'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'

interface ReportFiltersProps {
    filters: ReportFilter
    onFilterChange: (filters: ReportFilter) => void
}

const statusOptions: { value: ReportStatus; label: string }[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending_qs_review', label: 'Pending Review' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'revision_requested', label: 'Revision Needed' },
    { value: 'site_visit_scheduled', label: 'Site Visit Scheduled' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'archived', label: 'Archived' },
]

export const ReportFilters: React.FC<ReportFiltersProps> = ({
    filters,
    onFilterChange,
}) => {
    const [localFilters, setLocalFilters] = useState<ReportFilter>(filters)

    const handleSearchChange = (value: string) => {
        const newFilters = { ...localFilters, search: value }
        setLocalFilters(newFilters)
        onFilterChange(newFilters)
    }

    const handleStatusChange = (value: string) => {
        const newFilters = {
            ...localFilters,
            status: value ? [value as ReportStatus] : undefined,
        }
        setLocalFilters(newFilters)
        onFilterChange(newFilters)
    }

    const handleClearFilters = () => {
        const clearedFilters: ReportFilter = {}
        setLocalFilters(clearedFilters)
        onFilterChange(clearedFilters)
    }

    const hasActiveFilters =
        localFilters.search ||
        localFilters.status?.length ||
        localFilters.clientId ||
        localFilters.startDate ||
        localFilters.endDate

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                    <Input
                        type="text"
                        placeholder="Search reports by title, number, or description..."
                        value={localFilters.search || ''}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        leftIcon={
                            <svg className="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        }
                    />
                </div>

                {/* Status Filter */}
                <div>
                    <Select
                        value={localFilters.status?.[0] || ''}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        options={[
                            { value: '', label: 'All Statuses' },
                            ...statusOptions,
                        ]}
                    />
                </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilters}
                    >
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    )
}
