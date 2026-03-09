// src/pages/qs/QSDashboard.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useGetAllRmChecklistsQuery } from '@/services/api/checklistsApi'
import { qsApi } from '@/services/api/qsApi'
import { transformChecklistsToReports } from '@/utils/checklistTransform'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { ReviewQueue } from '@/components/qs/ReviewQueue/ReviewQueue'
import { UpcomingVisits } from '@/components/qs/UpcomingVisits/UpcomingVisits'
import { PerformanceMetrics } from '@/components/qs/PerformanceMetrics/PerformanceMetrics'
import { Button } from '@/components/common/Button'
import { SiteVisitReport } from '@/types/report.types'
import { FiPlus, FiClock, FiCheckCircle, FiAlertCircle, FiCalendar, FiTrendingUp } from 'react-icons/fi'

interface DashboardStats {
  pendingReviews: number
  inProgress: number
  completedToday: number
  scheduledVisits: number
  averageResponseTime: string
  criticalIssues: number
  myActiveReviews: number
  overdueReviews: number
}

export const QSDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: checklists = [], isLoading, error } = useGetAllRmChecklistsQuery()

  const [stats, setStats] = useState<DashboardStats>({
    pendingReviews: 0,
    inProgress: 0,
    completedToday: 0,
    scheduledVisits: 0,
    averageResponseTime: '0h',
    criticalIssues: 0,
    myActiveReviews: 0,
    overdueReviews: 0
  })

  const [pendingReviews, setPendingReviews] = useState<SiteVisitReport[]>([])
  const [myReviews, setMyReviews] = useState<SiteVisitReport[]>([])
  const [upcomingVisits, setUpcomingVisits] = useState<any[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Transform API data to reports
  const allReports = React.useMemo(() => {
    return transformChecklistsToReports(checklists)
  }, [checklists])

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (error) {
      console.error('Failed to load checklists:', error)
    }
  }, [error])


  const loadDashboardData = async () => {
    setIsLoadingStats(true)
    try {
      // Get QS-specific stats from API
      const statsResponse = await qsApi.getDashboardStats()
      setStats(statsResponse.data)

      // Get pending reviews
      const pendingResponse = await qsApi.getPendingReviews(1, 5)
      setPendingReviews(pendingResponse.data.items || [])

      // TEMPORARY FIX: Comment out the 404 endpoint
      // const visitsResponse = await qsApi.getScheduledVisits()
      // setUpcomingVisits(visitsResponse.data || [])
      setUpcomingVisits([]) // Set empty array for now

      // Calculate my active reviews from transformed data
      const myActiveReviews = allReports.filter(r =>
        r.assignedToQS === user?.id &&
        (r.status === 'under_review' || r.status === 'rework')
      )
      setMyReviews(myActiveReviews.slice(0, 5))

      // Update stats with calculated values
      setStats(prev => ({
        ...prev,
        myActiveReviews: myActiveReviews.length,
        pendingReviews: allReports.filter(r =>
          r.status === 'submitted' ||
          r.status === 'pending_qs_review'
        ).length,
        inProgress: allReports.filter(r => r.status === 'rework').length
      }))

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // Fallback to calculated stats from checklists
      calculateStatsFromChecklists()
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Calculate stats from checklists as fallback
  const calculateStatsFromChecklists = () => {
    const pendingCount = allReports.filter(r =>
      r.status?.toLowerCase() === 'pendingqsreview' ||
      r.status?.toLowerCase() === 'pending_qs_review' ||
      r.status?.toLowerCase() === 'submitted'
    ).length

    const inProgressCount = allReports.filter(r =>
      r.status?.toLowerCase() === 'rework'
    ).length

    const criticalCount = allReports.filter(r =>
      r.priority === 'high' || r.priority === 'critical'
    ).length

    setStats(prev => ({
      ...prev,
      pendingReviews: pendingCount,
      inProgress: inProgressCount,
      criticalIssues: criticalCount,
      scheduledVisits: upcomingVisits.length
    }))
  }

  const handleAssignToMe = async (reportId: string) => {
    try {
      await qsApi.assignReport(reportId)
      loadDashboardData() // Reload data
      navigate(`/qs/reviews/${reportId}`)
    } catch (error) {
      console.error('Failed to assign report:', error)
    }
  }

  // Prepare stats for StatsCards component
  const dashboardStats = [
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: <FiClock className="w-4 h-4" />,
      color: 'bg-amber-500',
      trend: stats.pendingReviews > 0 ? 'up' : 'neutral',
      trendValue: `${stats.pendingReviews} waiting`
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: <FiTrendingUp className="w-4 h-4" />,
      color: 'bg-blue-500',
      trend: 'neutral',
      trendValue: `${stats.myActiveReviews} assigned to you`
    },
    {
      title: 'Completed Today',
      value: stats.completedToday,
      icon: <FiCheckCircle className="w-4 h-4" />,
      color: 'bg-emerald-500',
      trend: stats.completedToday > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Scheduled Visits',
      value: stats.scheduledVisits,
      icon: <FiCalendar className="w-4 h-4" />,
      color: 'bg-purple-500',
      trend: 'neutral'
    }
  ]

  // Horizontal scroll for mobile
  const statsScrollRef = useRef<HTMLDivElement>(null)

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

  const MobileHeader = () => (
    <div className="sticky top-0 z-20 bg-[#F5F7F4] border-b border-[#D6BD98]/20 px-4 py-1.5 lg:hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xs font-semibold text-[#1A3636]">
            QS Dashboard
          </h1>
          <p className="text-[8px] text-[#677D6A]">
            {user?.firstName || 'QS'} • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {stats.criticalIssues > 0 && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-50 rounded-full">
              <FiAlertCircle className="w-2.5 h-2.5 text-red-500" />
              <span className="text-[8px] font-medium text-red-600">{stats.criticalIssues}</span>
            </div>
          )}
          <button
            onClick={() => navigate('/qs/reviews')}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white hover:shadow-sm transition-shadow"
          >
            <FiPlus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )

  const DesktopHeader = () => (
    <div className="hidden lg:block border-b border-[#D6BD98]/20 bg-[#F5F7F4] px-6 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-[#1A3636]">
            Welcome back, {user?.firstName || 'QS'}
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
        <div className="flex items-center gap-3">
          {stats.criticalIssues > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg">
              <FiAlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs font-medium text-red-700">
                {stats.criticalIssues} critical {stats.criticalIssues === 1 ? 'issue' : 'issues'} pending
              </span>
            </div>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/qs/reviews')}
            className="h-8 text-xs"
          >
            <FiPlus className="w-3.5 h-3.5 mr-1.5" />
            View All Reviews
          </Button>
        </div>
      </div>
    </div>
  )

  if (isLoading && isLoadingStats) {
    return (
      <div className="min-h-screen bg-[#F5F7F4]">
        <MobileHeader />
        <DesktopHeader />
        <div className="px-4 sm:px-6 py-8">
          <div className="flex justify-center">
            <div className="animate-pulse space-y-4 w-full max-w-4xl">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-40 bg-gray-200 rounded"></div>
              <div className="h-60 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F7F4]">
      <MobileHeader />
      <DesktopHeader />

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        {/* Stats Cards - Mobile Horizontal Scroll */}
        <div className="relative -mx-4 sm:mx-0 mb-4 sm:mb-5">
          <div
            ref={statsScrollRef}
            className="overflow-x-auto scrollbar-hide px-4 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2 min-w-max sm:min-w-0">
              <StatsCards stats={dashboardStats} role="qs" />
            </div>
          </div>
        </div>

        {/* Performance Metrics - Mobile Optimized */}
        <div className="mb-4 sm:mb-5">
          <PerformanceMetrics
            averageResponseTime={stats.averageResponseTime}
            myActiveReviews={stats.myActiveReviews}
            overdueReviews={stats.overdueReviews}
            completedToday={stats.completedToday}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
          {/* Left Column - Review Queue */}
          <div className="lg:col-span-2">
            <div className="border border-[#D6BD98]/20 rounded-lg bg-white overflow-hidden">
              <div className="px-3 py-2 border-b border-[#D6BD98]/20 bg-gradient-to-r from-[#1A3636]/5 to-transparent">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-[#1A3636]">
                    Review Queue
                  </h2>
                  <span className="px-1.5 py-0.5 bg-[#D6BD98] text-[#1A3636] text-[8px] font-medium rounded-full">
                    {stats.pendingReviews} pending
                  </span>
                </div>
              </div>
              <ReviewQueue
                reports={pendingReviews}
                onAssign={handleAssignToMe}
                onView={(id) => navigate(`/qs/reviews/${id}`)}
                isLoading={isLoadingStats}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3 sm:space-y-4">
            {/* My Active Reviews */}
            <div className="border border-[#D6BD98]/20 rounded-lg bg-white overflow-hidden">
              <div className="px-3 py-2 border-b border-[#D6BD98]/20">
                <h2 className="text-xs font-semibold text-[#1A3636]">
                  My Active Reviews
                </h2>
              </div>
              <div className="divide-y divide-[#D6BD98]/10">
                {myReviews.length === 0 ? (
                  <div className="px-3 py-4 text-center">
                    <p className="text-[10px] text-[#677D6A]">
                      No active reviews assigned to you
                    </p>
                  </div>
                ) : (
                  myReviews.slice(0, 3).map((report) => (
                    <div
                      key={report.id}
                      onClick={() => navigate(`/qs/reviews/${report.id}`)}
                      className="px-3 py-2 hover:bg-[#F5F7F4] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9px] font-medium text-[#1A3636]">
                          {report.reportNo || `CRN-${report.id.slice(0, 8)}`}
                        </span>
                        <span className="text-[8px] text-[#677D6A]">
                          Started {new Date(report.updatedAt || report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[8px] text-[#677D6A] truncate">
                        {report.customerName || report.projectName || 'Untitled'}
                      </p>
                    </div>
                  ))
                )}
                {myReviews.length > 3 && (
                  <button
                    onClick={() => navigate('/qs/reviews?filter=my-active')}
                    className="w-full px-3 py-1.5 text-[8px] text-[#1A3636] hover:bg-[#F5F7F4] transition-colors border-t border-[#D6BD98]/10"
                  >
                    View all {myReviews.length} active reviews
                  </button>
                )}
              </div>
            </div>

            {/* Upcoming Site Visits */}
            <UpcomingVisits
              visits={upcomingVisits}
              onView={(id) => navigate(`/qs/site-visits/${id}`)}
            />

            {/* Recent Activity */}
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
            <QuickActions
              actions={[
                {
                  label: 'Start Review',
                  onClick: () => navigate('/qs/reviews'),
                  icon: 'review',
                  variant: 'primary'
                },
                {
                  label: 'Schedule Visit',
                  onClick: () => navigate('/qs/schedule'),
                  icon: 'calendar'
                },
                {
                  label: 'My Reviews',
                  onClick: () => navigate('/qs/reviews?filter=my-active'),
                  icon: 'list'
                },
                {
                  label: 'Performance',
                  onClick: () => navigate('/qs/analytics'),
                  icon: 'chart'
                }
              ]}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

export default QSDashboard