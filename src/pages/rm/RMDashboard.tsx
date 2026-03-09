// src/pages/rm/RMDashboard.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useGetAllRmChecklistsQuery } from '@/services/api/checklistsApi'
import { transformChecklistsToReports } from '@/utils/checklistTransform'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { ProgressTrail } from '@/components/dashboard/ProgressTrail'
import { Button } from '@/components/common/Button'
import { ReportsTable } from '@/components/reports/ReportsTable'
import { reportsApi } from '@/services/api/reportsApi'
import { SiteVisitReport } from '@/types/report.types'
import { FiPlus, FiMenu, FiX, FiCode } from 'react-icons/fi'

export const RMDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const { data: checklists = [], isLoading, error } = useGetAllRmChecklistsQuery()
  
  const [pendingReports, setPendingReports] = useState<SiteVisitReport[]>([])
  const [isLoadingPending, setIsLoadingPending] = useState(false)
  const [showDummyData, setShowDummyData] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const statsScrollRef = useRef<HTMLDivElement>(null)

  // Transform checklists to reports format
  const realReports = React.useMemo(() => {
    return transformChecklistsToReports(checklists)
  }, [checklists])

  useEffect(() => {
    if (error) {
      console.error('Failed to load checklists:', error)
    }
  }, [error])

  useEffect(() => {
    const fetchPendingReports = async () => {
      setIsLoadingPending(true)
      try {
        const response = await reportsApi.getMyPendingReports()
        setPendingReports(response.data || [])
      } catch (error) {
        console.error('Failed to fetch pending reports:', error)
        setPendingReports([])
      } finally {
        setIsLoadingPending(false)
      }
    }
    fetchPendingReports()
  }, [])

  const displayReports = realReports

  // Calculate stats based on actual data
  const stats = {
    totalReports: displayReports?.length || 0,
    pendingReviews: displayReports?.filter(r => 
      r.status === 'submitted' || 
      r.status === 'pending_qs_review' || 
      r.status === 'pendingqsreview'
    ).length || 0,
    approved: displayReports?.filter(r => 
      r.status === 'approved' || 
      r.status === 'completed'
    ).length || 0,
    revisions: displayReports?.filter(r => 
      r.status === 'rework' || 
      r.status === 'returned' || 
      r.status === 'revision_requested'
    ).length || 0,
  }

  const recentReports = displayReports?.slice(0, 5) || []

  useEffect(() => {
    const scrollContainer = statsScrollRef.current
    if (!scrollContainer) return

    const handleWheel = (e: WheelEvent) => {
      if (window.innerWidth < 768) {
        e.preventDefault()
        scrollContainer.scrollLeft += e.deltaY
      }
    }

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false })
    return () => scrollContainer.removeEventListener('wheel', handleWheel)
  }, [])

  const MobileHeaderActions = () => (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => navigate('/rm/checklists?newCallReport=1')}
        className="w-7 h-7 flex items-center justify-center rounded-md bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white hover:shadow-sm transition-shadow"
        aria-label="Create new report"
      >
        <FiPlus className="w-3 h-3" />
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F5F7F4]">
      {/* Mobile Header */}
      <div className="sticky top-0 z-20 bg-[#F5F7F4] border-b border-[#D6BD98]/20 px-4 py-1.5 lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xs font-semibold text-[#1A3636]">
              Welcome back
            </h1>
            <p className="text-[8px] text-[#677D6A]">
              {user?.firstName || 'User'} • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <MobileHeaderActions />
        </div>
      </div>

      {/* Desktop Welcome Section */}
      <div className="hidden lg:block border-b border-[#D6BD98]/20 bg-[#F5F7F4] px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-[#1A3636]">
              Welcome back, {user?.firstName || 'User'}
            </h1>
            <p className="text-xs text-[#677D6A] mt-0.5">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/rm/checklists?newCallReport=1')}
            className="hidden lg:flex h-8 text-xs"
          >
            <FiPlus className="w-3.5 h-3.5 mr-1.5" />
            New Report
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        {/* Stats Cards */}
        <div className="relative -mx-4 sm:mx-0 mb-4 sm:mb-5">
          <div 
            ref={statsScrollRef}
            className="overflow-x-auto scrollbar-hide px-4 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2 min-w-max sm:min-w-0">
              <StatsCards stats={stats} />
            </div>
          </div>
        </div>

        {/* Pending QS Reviews Section */}
        {pendingReports.length > 0 && (
          <section className="mb-4 sm:mb-5">
            <div className="flex items-center gap-1.5 mb-2">
              <h2 className="text-xs sm:text-sm font-semibold text-[#1A3636]">
                Pending QS Reviews
              </h2>
              <span className="px-1 py-0.5 bg-[#D6BD98] text-[#1A3636] text-[8px] font-medium rounded-full">
                {pendingReports.length}
              </span>
            </div>
            
            <div className="border border-[#D6BD98]/20 rounded-lg overflow-hidden bg-white">
              <ReportsTable reports={pendingReports} />
            </div>
          </section>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="lg:col-span-2">
            <ProgressTrail reports={displayReports} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-1">
            <div className="border border-[#D6BD98]/20 rounded-lg bg-white p-3">
              <h2 className="text-xs font-semibold text-[#1A3636] mb-2">
                Recent Activity
              </h2>
              <ActivityFeed />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-[#1A3636]">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <QuickActions />
          </div>
        </section>
      </div>
    </div>
  )
}

export default RMDashboard