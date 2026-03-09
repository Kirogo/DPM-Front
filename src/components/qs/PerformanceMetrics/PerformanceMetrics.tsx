// src/components/qs/PerformanceMetrics/PerformanceMetrics.tsx
import React from 'react'
import { FiClock, FiCheckCircle, FiAlertCircle, FiTrendingUp } from 'react-icons/fi'

interface PerformanceMetricsProps {
  averageResponseTime: string
  myActiveReviews: number
  overdueReviews: number
  completedToday: number
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  averageResponseTime,
  myActiveReviews,
  overdueReviews,
  completedToday
}) => {
  // Mobile view - horizontal scroll
  const MobileView = () => (
    <div className="block sm:hidden">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex-shrink-0 w-32 bg-white rounded-lg border border-[#D6BD98]/20 p-2">
          <div className="flex items-center gap-1 mb-1">
            <FiClock className="w-3 h-3 text-[#677D6A]" />
            <span className="text-[8px] text-[#677D6A]">Avg Response</span>
          </div>
          <p className="text-xs font-semibold text-[#1A3636]">{averageResponseTime}</p>
        </div>

        <div className="flex-shrink-0 w-32 bg-white rounded-lg border border-[#D6BD98]/20 p-2">
          <div className="flex items-center gap-1 mb-1">
            <FiTrendingUp className="w-3 h-3 text-[#677D6A]" />
            <span className="text-[8px] text-[#677D6A]">My Reviews</span>
          </div>
          <p className="text-xs font-semibold text-[#1A3636]">{myActiveReviews}</p>
        </div>

        {overdueReviews > 0 && (
          <div className="flex-shrink-0 w-32 bg-red-50 rounded-lg border border-red-200 p-2">
            <div className="flex items-center gap-1 mb-1">
              <FiAlertCircle className="w-3 h-3 text-red-600" />
              <span className="text-[8px] text-red-600">Overdue</span>
            </div>
            <p className="text-xs font-semibold text-red-700">{overdueReviews}</p>
          </div>
        )}

        <div className="flex-shrink-0 w-32 bg-white rounded-lg border border-[#D6BD98]/20 p-2">
          <div className="flex items-center gap-1 mb-1">
            <FiCheckCircle className="w-3 h-3 text-[#677D6A]" />
            <span className="text-[8px] text-[#677D6A]">Completed</span>
          </div>
          <p className="text-xs font-semibold text-[#1A3636]">{completedToday} today</p>
        </div>
      </div>
    </div>
  )

  // Desktop view - grid
  const DesktopView = () => (
    <div className="hidden sm:grid sm:grid-cols-4 gap-3">
      <div className="bg-white rounded-lg border border-[#D6BD98]/20 p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-[#D6BD98]/10 rounded">
            <FiClock className="w-3.5 h-3.5 text-[#1A3636]" />
          </div>
          <span className="text-[10px] text-[#677D6A]">Average Response Time</span>
        </div>
        <p className="text-sm font-semibold text-[#1A3636] ml-8">{averageResponseTime}</p>
      </div>

      <div className="bg-white rounded-lg border border-[#D6BD98]/20 p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-[#D6BD98]/10 rounded">
            <FiTrendingUp className="w-3.5 h-3.5 text-[#1A3636]" />
          </div>
          <span className="text-[10px] text-[#677D6A]">My Active Reviews</span>
        </div>
        <p className="text-sm font-semibold text-[#1A3636] ml-8">{myActiveReviews}</p>
      </div>

      <div className={`bg-white rounded-lg border ${overdueReviews > 0 ? 'border-red-200' : 'border-[#D6BD98]/20'} p-3`}>
        <div className="flex items-center gap-2 mb-1">
          <div className={`p-1.5 ${overdueReviews > 0 ? 'bg-red-50' : 'bg-[#D6BD98]/10'} rounded`}>
            <FiAlertCircle className={`w-3.5 h-3.5 ${overdueReviews > 0 ? 'text-red-600' : 'text-[#1A3636]'}`} />
          </div>
          <span className={`text-[10px] ${overdueReviews > 0 ? 'text-red-600' : 'text-[#677D6A]'}`}>
            Overdue Reviews
          </span>
        </div>
        <p className={`text-sm font-semibold ml-8 ${overdueReviews > 0 ? 'text-red-700' : 'text-[#1A3636]'}`}>
          {overdueReviews}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-[#D6BD98]/20 p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-[#D6BD98]/10 rounded">
            <FiCheckCircle className="w-3.5 h-3.5 text-[#1A3636]" />
          </div>
          <span className="text-[10px] text-[#677D6A]">Completed Today</span>
        </div>
        <p className="text-sm font-semibold text-[#1A3636] ml-8">{completedToday}</p>
      </div>
    </div>
  )

  return (
    <>
      <MobileView />
      <DesktopView />
    </>
  )
}