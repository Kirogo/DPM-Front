// src/components/qs/UpcomingVisits/UpcomingVisits.tsx
import React from 'react'
import { FiMapPin, FiCalendar, FiClock, FiChevronRight } from 'react-icons/fi'
import { formatDistanceToNow, format } from 'date-fns'

interface Visit {
  id: string
  reportId?: string
  report?: {
    title?: string
    projectName?: string
    customerName?: string
  }
  siteAddress?: string
  scheduledDate: string
  scheduledTime?: string
  status?: string
  notes?: string
}

interface UpcomingVisitsProps {
  visits: Visit[]
  onView: (visitId: string) => void
}

export const UpcomingVisits: React.FC<UpcomingVisitsProps> = ({
  visits,
  onView
}) => {
  if (visits.length === 0) {
    return (
      <div className="border border-[#D6BD98]/20 rounded-lg bg-white p-3">
        <h2 className="text-xs font-semibold text-[#1A3636] mb-2">
          Upcoming Site Visits
        </h2>
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#D6BD98]/10 mb-1">
            <FiMapPin className="w-3.5 h-3.5 text-[#677D6A]" />
          </div>
          <p className="text-[9px] text-[#677D6A]">
            No upcoming visits
          </p>
          <button 
            onClick={() => onView('schedule')}
            className="mt-2 text-[8px] text-[#1A3636] hover:text-[#40534C] transition-colors"
          >
            Schedule a visit
          </button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'text-emerald-600 bg-emerald-50'
      case 'pending':
        return 'text-amber-600 bg-amber-50'
      case 'completed':
        return 'text-blue-600 bg-blue-50'
      case 'cancelled':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-[#677D6A] bg-[#D6BD98]/10'
    }
  }

  return (
    <div className="border border-[#D6BD98]/20 rounded-lg bg-white overflow-hidden">
      <div className="px-3 py-2 border-b border-[#D6BD98]/20">
        <h2 className="text-xs font-semibold text-[#1A3636]">
          Upcoming Site Visits
        </h2>
      </div>

      <div className="divide-y divide-[#D6BD98]/10">
        {visits.slice(0, 3).map((visit) => (
          <div 
            key={visit.id}
            onClick={() => onView(visit.id)}
            className="px-3 py-2 hover:bg-[#F5F7F4] cursor-pointer transition-colors"
          >
            {/* Mobile Layout */}
            <div className="block sm:hidden">
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-medium text-[#1A3636] truncate">
                    {visit.report?.projectName || visit.report?.title || 'Site Visit'}
                  </p>
                  {visit.siteAddress && (
                    <p className="text-[7px] text-[#677D6A] truncate mt-0.5">
                      {visit.siteAddress}
                    </p>
                  )}
                </div>
                {visit.status && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[6px] font-medium ${getStatusColor(visit.status)}`}>
                    {visit.status}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <FiCalendar className="w-2.5 h-2.5 text-[#677D6A]" />
                  <span className="text-[7px] text-[#677D6A]">
                    {format(new Date(visit.scheduledDate), 'MMM d')}
                  </span>
                </div>
                {visit.scheduledTime && (
                  <div className="flex items-center gap-1">
                    <FiClock className="w-2.5 h-2.5 text-[#677D6A]" />
                    <span className="text-[7px] text-[#677D6A]">
                      {visit.scheduledTime}
                    </span>
                  </div>
                )}
                <span className="text-[7px] text-[#677D6A]">
                  {formatDistanceToNow(new Date(visit.scheduledDate), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <FiMapPin className="w-3.5 h-3.5 text-[#677D6A] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-medium text-[#1A3636] truncate">
                      {visit.report?.projectName || visit.report?.title || 'Site Visit'}
                    </p>
                    {visit.siteAddress && (
                      <p className="text-[8px] text-[#677D6A] truncate mt-0.5">
                        {visit.siteAddress}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <div className="text-right">
                  <p className="text-[9px] font-medium text-[#1A3636]">
                    {format(new Date(visit.scheduledDate), 'MMM d, yyyy')}
                  </p>
                  <p className="text-[8px] text-[#677D6A]">
                    {visit.scheduledTime || 'Time TBD'}
                  </p>
                </div>
                {visit.status && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-medium ${getStatusColor(visit.status)}`}>
                    {visit.status}
                  </span>
                )}
                <FiChevronRight className="w-3 h-3 text-[#677D6A]" />
              </div>
            </div>
          </div>
        ))}

        {visits.length > 3 && (
          <button 
            onClick={() => onView('all')}
            className="w-full px-3 py-2 text-[8px] text-[#1A3636] hover:bg-[#F5F7F4] transition-colors border-t border-[#D6BD98]/10"
          >
            View all {visits.length} scheduled visits
          </button>
        )}
      </div>
    </div>
  )
}