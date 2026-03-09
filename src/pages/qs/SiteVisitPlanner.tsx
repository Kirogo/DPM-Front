import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { qsApi } from '@/services/api/qsApi'
import { SiteVisitReport } from '@/types/report.types'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { SiteMap } from '@/components/maps/SiteMap'
import { GeotaggedPhoto } from '@/types/geotag.types'
import { formatDate, formatTime } from '@/utils/formatters/dateFormatter'
import toast from 'react-hot-toast'

interface ScheduledVisit {
  id: string
  reportId: string
  report?: SiteVisitReport
  scheduledDate: Date
  qsId: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  notes?: string
  siteCoordinates?: {
    lat: number
    lng: number
  }
}

export const SiteVisitPlanner: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [visits, setVisits] = useState<ScheduledVisit[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedVisit, setSelectedVisit] = useState<ScheduledVisit | null>(null)

  useEffect(() => {
    loadScheduledVisits()
  }, [selectedDate])

  const loadScheduledVisits = async () => {
    setIsLoading(true)
    try {
      const response = await qsApi.getScheduledVisits(new Date(selectedDate))
      setVisits(response.data)
    } catch (error) {
      toast.error('Failed to load scheduled visits')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (visitId: string, status: string) => {
    try {
      // API call to update status
      await new Promise(resolve => setTimeout(resolve, 500))
      setVisits(visits.map(v => 
        v.id === visitId ? { ...v, status: status as any } : v
      ))
      toast.success(`Visit marked as ${status}`)
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleReschedule = async (visitId: string, newDate: string) => {
    try {
      // API call to reschedule
      await new Promise(resolve => setTimeout(resolve, 500))
      setVisits(visits.map(v => 
        v.id === visitId ? { ...v, scheduledDate: new Date(newDate), status: 'rescheduled' } : v
      ))
      toast.success('Visit rescheduled')
    } catch (error) {
      toast.error('Failed to reschedule')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-warning/10 text-warning'
      case 'completed':
        return 'bg-success/10 text-success'
      case 'cancelled':
        return 'bg-error/10 text-error'
      case 'rescheduled':
        return 'bg-info/10 text-info'
      default:
        return 'bg-secondary-100 text-secondary-800'
    }
  }

  // Prepare map data
  const mapPhotos: GeotaggedPhoto[] = visits
    .filter(v => v.siteCoordinates)
    .map(v => ({
      id: v.id,
      file: new File([], ''),
      url: '',
      thumbnailUrl: '',
      geotag: v.siteCoordinates ? {
        latitude: v.siteCoordinates.lat,
        longitude: v.siteCoordinates.lng,
        timestamp: new Date(),
      } : { latitude: 0, longitude: 0, timestamp: new Date() },
      uploadedAt: new Date(),
    }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Site Visit Planner</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Schedule and manage your site visits
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            onClick={() => setViewMode('list')}
            leftIcon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            }
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'map' ? 'primary' : 'outline'}
            onClick={() => setViewMode('map')}
            leftIcon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
          >
            Map View
          </Button>
        </div>
      </div>

      {/* Date Selector */}
      <Card>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              type="date"
              label="Select Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <Button
            variant="primary"
            onClick={() => loadScheduledVisits()}
            className="mt-6"
          >
            Load Visits
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" label="Loading visits..." />
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="space-y-4">
          {visits.length === 0 ? (
            <Card className="text-center py-12">
              <div className="flex justify-center">
                <svg
                  className="h-12 w-12 text-secondary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-secondary-900">
                No visits scheduled
              </h3>
              <p className="mt-2 text-sm text-secondary-500">
                No site visits are scheduled for this date.
              </p>
            </Card>
          ) : (
            visits.map((visit) => (
              <Card key={visit.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-secondary-900">
                        {visit.report?.title || 'Site Visit'}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(visit.status)}`}>
                        {visit.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-secondary-500">Client</p>
                        <p className="text-sm font-medium text-secondary-900">
                          {visit.report?.client?.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-secondary-500">Site Address</p>
                        <p className="text-sm text-secondary-900">
                          {visit.report?.siteAddress || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-secondary-500">Date & Time</p>
                        <p className="text-sm text-secondary-900">
                          {formatDate(visit.scheduledDate)} at {formatTime(visit.scheduledDate)}
                        </p>
                      </div>
                      {visit.notes && (
                        <div className="col-span-2">
                          <p className="text-xs text-secondary-500">Notes</p>
                          <p className="text-sm text-secondary-600">{visit.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    {visit.status === 'scheduled' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleStatusChange(visit.id, 'completed')}
                        >
                          Mark Completed
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newDate = prompt('Enter new date (YYYY-MM-DD):')
                            if (newDate) handleReschedule(visit.id, newDate)
                          }}
                        >
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleStatusChange(visit.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/qs/reviews/${visit.reportId}`)}
                    >
                      View Report
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Map View */
        <Card padding="none" className="overflow-hidden">
          <div style={{ height: '600px' }}>
            <SiteMap
              photos={mapPhotos}
              siteLocation={selectedVisit?.siteCoordinates ? {
                lat: selectedVisit.siteCoordinates.lat,
                lng: selectedVisit.siteCoordinates.lng,
                address: selectedVisit.report?.siteAddress || '',
              } : undefined}
              onPhotoClick={(photo) => {
                const visit = visits.find(v => v.id === photo.id)
                setSelectedVisit(visit || null)
              }}
            />
          </div>

          {/* Selected Visit Info */}
          {selectedVisit && (
            <div className="p-4 border-t border-secondary-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-secondary-900">
                    {selectedVisit.report?.title || 'Selected Visit'}
                  </h4>
                  <p className="text-sm text-secondary-600 mt-1">
                    {selectedVisit.report?.siteAddress}
                  </p>
                  <p className="text-xs text-secondary-500 mt-1">
                    Scheduled: {formatDate(selectedVisit.scheduledDate)} at {formatTime(selectedVisit.scheduledDate)}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate(`/qs/reviews/${selectedVisit.reportId}`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">
              {visits.filter(v => v.status === 'scheduled').length}
            </p>
            <p className="text-sm text-secondary-600 mt-1">Scheduled</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-success-600">
              {visits.filter(v => v.status === 'completed').length}
            </p>
            <p className="text-sm text-secondary-600 mt-1">Completed</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-warning-600">
              {visits.filter(v => v.status === 'rescheduled').length}
            </p>
            <p className="text-sm text-secondary-600 mt-1">Rescheduled</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default SiteVisitPlanner