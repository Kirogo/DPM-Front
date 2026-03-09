// src/pages/qs/QSSiteVisitsPage.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { qsApi } from '@/services/api/qsApi'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { FiCalendar, FiMapPin, FiClock, FiPlus, FiChevronRight } from 'react-icons/fi'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface SiteVisit {
  id: string
  reportId?: string
  report?: {
    title?: string
    projectName?: string
    customerName?: string
    reportNo?: string
  }
  siteAddress: string
  scheduledDate: string
  scheduledTime?: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  rmName?: string
  qsName?: string
}

export const QSSiteVisitsPage: React.FC = () => {
  const navigate = useNavigate()
  const [visits, setVisits] = useState<SiteVisit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'upcoming' | 'today' | 'all'>('upcoming')

  useEffect(() => {
    loadVisits()
  }, [filter])

  const loadVisits = async () => {
    setIsLoading(true)
    try {
      const response = await qsApi.getScheduledVisits()
      let filteredVisits = response.data || []
      
      // Apply filter
      const today = new Date().toDateString()
      if (filter === 'today') {
        filteredVisits = filteredVisits.filter((v: SiteVisit) => 
          new Date(v.scheduledDate).toDateString() === today
        )
      } else if (filter === 'upcoming') {
        filteredVisits = filteredVisits.filter((v: SiteVisit) => 
          new Date(v.scheduledDate) >= new Date()
        )
      }
      
      setVisits(filteredVisits)
    } catch (error) {
      toast.error('Failed to load site visits')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      case 'scheduled':
        return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-[#677D6A] bg-[#D6BD98]/10 border-[#D6BD98]/20'
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7F4]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#F5F7F4] border-b border-[#D6BD98]/20 px-4 py-2 lg:px-6 lg:py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xs lg:text-sm font-semibold text-[#1A3636]">
              Site Visits
            </h1>
            <p className="text-[8px] lg:text-xs text-[#677D6A] mt-0.5">
              Manage and schedule site inspections
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/qs/schedule/new')}
            className="h-7 lg:h-8 text-[10px] lg:text-xs"
          >
            <FiPlus className="w-3 h-3 lg:w-3.5 lg:h-3.5 mr-1" />
            Schedule Visit
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 mt-2 lg:mt-3">
          <button
            onClick={() => setFilter('upcoming')}
            className={`flex-1 lg:flex-none px-2 lg:px-3 py-1.5 text-[9px] lg:text-xs font-medium rounded-md transition-colors ${
              filter === 'upcoming'
                ? 'bg-[#1A3636] text-white'
                : 'bg-white text-[#677D6A] hover:bg-[#D6BD98]/10'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`flex-1 lg:flex-none px-2 lg:px-3 py-1.5 text-[9px] lg:text-xs font-medium rounded-md transition-colors ${
              filter === 'today'
                ? 'bg-[#1A3636] text-white'
                : 'bg-white text-[#677D6A] hover:bg-[#D6BD98]/10'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 lg:flex-none px-2 lg:px-3 py-1.5 text-[9px] lg:text-xs font-medium rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-[#1A3636] text-white'
                : 'bg-white text-[#677D6A] hover:bg-[#D6BD98]/10'
            }`}
          >
            All Visits
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 lg:px-6 py-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" label="Loading site visits..." />
          </div>
        ) : visits.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#D6BD98]/10 mb-3">
              <FiCalendar className="w-5 h-5 text-[#677D6A]" />
            </div>
            <p className="text-xs text-[#677D6A]">
              No {filter} site visits found
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/qs/schedule/new')}
              className="mt-3 h-7 text-[10px]"
            >
              <FiPlus className="w-3 h-3 mr-1" />
              Schedule First Visit
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {visits.map((visit) => (
              <div
                key={visit.id}
                onClick={() => navigate(`/qs/schedule/${visit.id}`)}
                className="bg-white border border-[#D6BD98]/20 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer"
              >
                {/* Mobile Layout */}
                <div className="block lg:hidden">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[10px] font-medium text-[#1A3636]">
                          {visit.report?.reportNo || `Visit-${visit.id.slice(0,6)}`}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[6px] font-medium border ${getStatusColor(visit.status)}`}>
                          {visit.status}
                        </span>
                      </div>
                      <p className="text-[9px] text-[#677D6A]">
                        {visit.report?.projectName || 'Site Visit'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center gap-1">
                      <FiCalendar className="w-2.5 h-2.5 text-[#677D6A]" />
                      <span className="text-[8px] text-[#677D6A]">
                        {format(new Date(visit.scheduledDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {visit.scheduledTime && (
                      <div className="flex items-center gap-1">
                        <FiClock className="w-2.5 h-2.5 text-[#677D6A]" />
                        <span className="text-[8px] text-[#677D6A]">
                          {visit.scheduledTime}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <FiMapPin className="w-2.5 h-2.5 text-[#677D6A]" />
                      <span className="text-[8px] text-[#677D6A] truncate">
                        {visit.siteAddress}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[7px] text-[#677D6A]">
                      RM: {visit.rmName || 'Unassigned'}
                    </span>
                    <FiChevronRight className="w-3 h-3 text-[#677D6A]" />
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:flex lg:items-center lg:justify-between">
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    {/* Visit Info */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1A3636]">
                          {visit.report?.reportNo || `Visit-${visit.id.slice(0,6)}`}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(visit.status)}`}>
                          {visit.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#677D6A] mt-1 truncate">
                        {visit.report?.projectName || 'Site Visit'}
                      </p>
                    </div>

                    {/* Date & Time */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-[#677D6A]" />
                        <span className="text-sm text-[#1A3636]">
                          {format(new Date(visit.scheduledDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {visit.scheduledTime && (
                        <div className="flex items-center gap-2 mt-1">
                          <FiClock className="w-4 h-4 text-[#677D6A]" />
                          <span className="text-xs text-[#677D6A]">
                            {visit.scheduledTime}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    <div className="col-span-4">
                      <div className="flex items-start gap-2">
                        <FiMapPin className="w-4 h-4 text-[#677D6A] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[#1A3636] truncate">
                          {visit.siteAddress}
                        </span>
                      </div>
                      <p className="text-xs text-[#677D6A] mt-1">
                        RM: {visit.rmName || 'Unassigned'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/qs/schedule/${visit.id}`)
                        }}
                        className="text-xs"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default QSSiteVisitsPage