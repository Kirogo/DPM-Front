// src/pages/qs/QSReviewDetailPage.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { qsApi } from '@/services/api/qsApi'
import axiosInstance from '@/services/api/axiosConfig'
// LOCK DISABLED: import { lockService, LockInfo, UserActiveLock } from '@/services/lockService'
import { SiteVisitReport, Comment } from '@/types/report.types'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import {
  FiArrowLeft,
  // LOCK DISABLED: FiLock,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiCamera,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiMessageSquare,
  FiDollarSign,
  FiBriefcase,
  FiClipboard,
  FiImage,
  FiFile,
  FiDownload,
  FiMessageCircle,
  FiInfo,
  FiSend
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { formatNairobiDateTime, formatCompactNairobiDateTime } from '@/utils/dateUtils'

interface ReviewState {
  report: SiteVisitReport | null
  comments: Comment[]
  isLoading: boolean
  isSubmitting: boolean
  isLocked: boolean
  lockedBy: { id: string; name: string } | null
  lockedAt: string | null
  activeTab: 'overview' | 'site-visit' | 'financial' | 'documents' | 'photos' | 'audit'
  showReworkModal: boolean
  showApproveModal: boolean
  showCommentModal: boolean
  reworkComment: string
  approveComment: string
  newComment: string
  // LOCK DISABLED: All lock-related state removed
  // isLockedByOther: boolean
  // lockOwnerName: string
  // lockOwnerRole: string
  // isCheckingUserLock: boolean
  // lockStatus: LockInfo | null
  // hasLockedReport: boolean
  // lockCheckComplete: boolean
}

// Tab configuration
const tabs = [
  { id: 'overview', label: 'Overview', icon: FiInfo },
  { id: 'site-visit', label: 'Site Visit', icon: FiMapPin },
  { id: 'financial', label: 'Financial', icon: FiBriefcase },
  { id: 'documents', label: 'Documents', icon: FiFileText },
  { id: 'photos', label: 'Photos', icon: FiCamera },
  { id: 'audit', label: 'Audit', icon: FiClipboard },
]

export const QSReviewDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  // LOCK DISABLED: mountedRef removed
  // const mountedRef = useRef<boolean>(true)
  // const lockCheckTimerRef = useRef<NodeJS.Timeout>()
  // const unlockTimerRef = useRef<NodeJS.Timeout>()

  const [state, setState] = useState<ReviewState>({
    report: null,
    comments: [],
    isLoading: true,
    isSubmitting: false,
    isLocked: false,
    lockedBy: null,
    lockedAt: null,
    activeTab: 'overview',
    showReworkModal: false,
    showApproveModal: false,
    showCommentModal: false,
    reworkComment: '',
    approveComment: '',
    newComment: '',
    // LOCK DISABLED: All lock-related state initialized to defaults
    // isLockedByOther: false,
    // lockOwnerName: '',
    // lockOwnerRole: '',
    // isCheckingUserLock: false,
    // lockStatus: null,
    // hasLockedReport: false,
    // lockCheckComplete: false
  })

  const commentsContainerRef = useRef<HTMLDivElement>(null)

  // LOCK DISABLED: mounted ref effect removed
  // useEffect(() => {
  //   mountedRef.current = true
  //   return () => {
  //     mountedRef.current = false
  //   }
  // }, [])

  // Main effect - load data directly (no lock checks)
  useEffect(() => {
    if (authLoading) {
      console.log('Auth is loading, waiting...')
      return
    }

    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login')
      navigate('/login')
      return
    }

    if (!id || !user) return

    const isValidGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    if (!isValidGuid) {
      console.error('Invalid ID format:', id)
      toast.error('Invalid report ID')
      navigate('/qs/reviews')
      return
    }

    // DEMO MODE: Load data directly without lock checks
    loadReportData()

    // LOCK DISABLED: Cleanup removed
    // return () => {
    //   if (lockCheckTimerRef.current) {
    //     clearTimeout(lockCheckTimerRef.current)
    //   }
    //   if (unlockTimerRef.current) {
    //     clearTimeout(unlockTimerRef.current)
    //   }
    //   if (id && state.hasLockedReport) {
    //     unlockTimerRef.current = setTimeout(() => {
    //       if (!mountedRef.current) {
    //         lockService.unlockReport(id, user?.id || '').catch(err => {
    //           console.log('Unlock error on unmount:', err)
    //         })
    //       }
    //     }, 1000)
    //   }
    //   lockService.stopAllChecks(id || '')
    // }
  }, [id, user, isAuthenticated, authLoading])

  // Scroll comments to bottom when new comments added
  useEffect(() => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight
    }
  }, [state.comments])

  // LOCK DISABLED: All lock-related methods removed
  // Step 1: Check lock status first
  // const checkLockFirst = async () => { ... }
  
  // Step 2: Acquire lock if needed
  // const acquireLock = async () => { ... }
  
  // Start lock monitoring
  // const startLockMonitoring = () => { ... }

  // Load report data
  const loadReportData = async () => {
    if (!id) return

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      console.log('Loading report with ID:', id)

      const response = await qsApi.getReportDetails(id!)
      console.log('QS API response:', response.data)

      const reportData = response.data

      await loadComments()

      setState(prev => ({
        ...prev,
        report: reportData,
        isLoading: false
      }))

    } catch (error: any) {
      console.error('Failed to load report details:', error)
      toast.error('Failed to load report details')
      navigate('/qs/reviews')
    }
  }

  const loadComments = async () => {
    try {
      console.log('Loading comments for report:', id)
      const commentsResponse = await axiosInstance.get(`/qs/reviews/${id}/comments`)
      console.log('Comments API response:', commentsResponse.data)
      
      if (commentsResponse.data && Array.isArray(commentsResponse.data)) {
        const mappedComments: Comment[] = commentsResponse.data.map((comment: any) => ({
          id: comment.id || '',
          reportId: comment.reportId || id || '',
          userId: comment.userId || '',
          userName: comment.userName || 'Unknown',
          userRole: comment.userRole || 'QS',
          text: comment.text || '',
          content: comment.text || '',
          isInternal: comment.isInternal || false,
          createdAt: comment.createdAt || new Date().toISOString()
        }))
        
        // Sort oldest first for chat-like display
        mappedComments.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        
        console.log('Mapped comments:', mappedComments)
        
        setState(prev => ({
          ...prev,
          comments: mappedComments
        }))
      } else {
        setState(prev => ({ ...prev, comments: [] }))
      }
    } catch (commentError: any) {
      console.error('Failed to load comments:', commentError)
      setState(prev => ({ ...prev, comments: [] }))
    }
  }

  const handleAddComment = async () => {
    if (!id || !state.newComment.trim()) return
    // LOCK DISABLED: Removed lock check
    // if (state.isLockedByOther) {
    //   toast.error('Cannot add comments while report is locked by another user')
    //   return
    // }

    setState(prev => ({ ...prev, isSubmitting: true }))
    try {
      const response = await axiosInstance.post(`/qs/reviews/${id}/comments`, {
        comment: state.newComment.trim(),
        isInternal: false
      })

      const newComment: Comment = {
        id: response.data.id || '',
        reportId: response.data.reportId || id,
        userId: response.data.userId || user?.id || '',
        userName: response.data.userName || user?.name || 'QS User',
        userRole: response.data.userRole || 'QS',
        text: response.data.text || state.newComment.trim(),
        content: response.data.text || state.newComment.trim(),
        isInternal: response.data.isInternal || false,
        createdAt: response.data.createdAt || new Date().toISOString()
      }

      setState(prev => ({
        ...prev,
        comments: [...prev.comments, newComment],
        newComment: '',
        isSubmitting: false
      }))

      toast.success('Comment added')
    } catch (error: any) {
      console.error('Failed to add comment:', error)
      toast.error('Failed to add comment')
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleRework = async () => {
    if (!id) return
    if (!state.reworkComment.trim()) {
      toast.error('Please provide comments for rework')
      return
    }

    setState(prev => ({ ...prev, isSubmitting: true }))
    try {
      await qsApi.requestRevision(id, state.reworkComment, [])

      toast.success('Report returned for rework. It will appear in your In Progress tab while RM makes changes.')

      // LOCK DISABLED: Removed unlock
      // if (state.hasLockedReport) {
      //   await lockService.unlockReport(id, user?.id || '')
      // }

      navigate('/qs/reviews/progress')
    } catch (error) {
      console.error('Rework error:', error)
      toast.error('Failed to process rework request')
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleApprove = async () => {
    if (!id) return

    setState(prev => ({ ...prev, isSubmitting: true }))
    try {
      await qsApi.approveReport(id, state.approveComment)

      toast.success('Report approved successfully')

      // LOCK DISABLED: Removed unlock
      // if (state.hasLockedReport) {
      //   await lockService.unlockReport(id, user?.id || '')
      // }

      navigate('/qs/reviews/completed')
    } catch (error) {
      console.error('Approve error:', error)
      toast.error('Failed to approve report')
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const formatCurrency = (value?: string) => {
    if (!value) return '—'
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }

  // ==================== RENDER FUNCTIONS FOR TABS ====================
  const renderOverviewTab = (report: SiteVisitReport, form: any) => (
    <div className="space-y-6 bg-white">
      <div>
        <h2 className="text-xs font-semibold text-[#677D6A] uppercase tracking-wider mb-3">Customer Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-[#677D6A]">Customer Name</p>
            <p className="text-sm font-medium text-[#1A3636] mt-0.5">{report.customerName || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[#677D6A]">Customer Number</p>
            <p className="text-sm text-[#40534C] mt-0.5">{report.customerNumber || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[#677D6A]">Email</p>
            <p className="text-sm text-[#40534C] truncate mt-0.5">{report.customerEmail || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[#677D6A]">IBPS Number</p>
            <p className="text-sm text-[#40534C] mt-0.5">{report.ibpsNo || '—'}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/20"></div>

      <div>
        <h2 className="text-xs font-semibold text-[#677D6A] uppercase tracking-wider mb-3">Project Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#677D6A]">Project Name</p>
            <p className="text-sm text-[#40534C] mt-0.5">{report.projectName || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[#677D6A]">RM</p>
            <p className="text-sm text-[#40534C] mt-0.5">{report.rmName || '—'}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/20"></div>

      <div>
        <h2 className="text-xs font-semibold text-[#677D6A] uppercase tracking-wider mb-3">Timeline</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#677D6A]">Submitted</p>
            <p className="text-sm text-[#40534C] mt-0.5">{formatNairobiDateTime(report.submittedAt)}</p>
          </div>
          <div>
            <p className="text-xs text-[#677D6A]">Last Updated</p>
            <p className="text-sm text-[#40534C] mt-0.5">{formatNairobiDateTime(report.updatedAt)}</p>
          </div>
        </div>
      </div>

      {form && (
        <>
          <div className="border-t border-[#D6BD98]/20"></div>
          <div>
            <h2 className="text-xs font-semibold text-[#677D6A] uppercase tracking-wider mb-3">Site Visit Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#677D6A]">Visit Date & Time</p>
                <p className="text-sm text-[#40534C] mt-0.5">{formatNairobiDateTime(form.siteVisitDateTime)}</p>
              </div>
              <div>
                <p className="text-xs text-[#677D6A]">Person Met</p>
                <p className="text-sm text-[#40534C] mt-0.5">{form.personMetAtSite || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-[#677D6A]">Location</p>
                <p className="text-sm text-[#40534C] mt-0.5">{form.siteExactLocation || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-[#677D6A]">Plot/LR No.</p>
                <p className="text-sm text-[#40534C] mt-0.5">{form.plotLrNo || '—'}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderSiteVisitTab = (form: any) => (
    <div className="space-y-6 bg-white">
      <div>
        <h2 className="text-xs font-semibold text-[#677D6A] uppercase tracking-wider mb-3 flex items-center gap-2">
          <FiMapPin className="w-3.5 h-3.5" />
          Visit Details
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#677D6A]">Date & Time</p>
            <p className="text-sm text-[#40534C] mt-0.5">{formatNairobiDateTime(form?.siteVisitDateTime)}</p>
          </div>
          <div>
            <p className="text-xs text-[#677D6A]">Person Met</p>
            <p className="text-sm text-[#40534C] mt-0.5">{form?.personMetAtSite || '—'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-[#677D6A]">Exact Location</p>
            <p className="text-sm text-[#40534C] mt-0.5">{form?.siteExactLocation || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[#677D6A]">Plot/LR No.</p>
            <p className="text-sm text-[#40534C] mt-0.5">{form?.plotLrNo || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[#677D6A]">House Located Along</p>
            <p className="text-sm text-[#40534C] mt-0.5">{form?.houseLocatedAlong || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[#677D6A]">Site PIN</p>
            <p className="text-sm text-[#40534C] mt-0.5">{form?.sitePin || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[#677D6A]">Security Details</p>
            <p className="text-sm text-[#40534C] mt-0.5">{form?.securityDetails || '—'}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/20"></div>

      <div>
        <h2 className="text-xs font-semibold text-[#677D6A] uppercase tracking-wider mb-3">Site Visit Objectives</h2>
        <div className="space-y-3">
          <div className="bg-[#F5F7F4] p-3 rounded-lg">
            <p className="text-xs text-[#677D6A] mb-1">Objective 1</p>
            <p className="text-sm text-[#40534C]">{form?.siteVisitObjective1 || 'Not specified'}</p>
          </div>
          <div className="bg-[#F5F7F4] p-3 rounded-lg">
            <p className="text-xs text-[#677D6A] mb-1">Objective 2</p>
            <p className="text-sm text-[#40534C]">{form?.siteVisitObjective2 || 'Not specified'}</p>
          </div>
          <div className="bg-[#F5F7F4] p-3 rounded-lg">
            <p className="text-xs text-[#677D6A] mb-1">Objective 3</p>
            <p className="text-sm text-[#40534C]">{form?.siteVisitObjective3 || 'Not specified'}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/20"></div>

      <div>
        <h2 className="text-xs font-semibold text-[#677D6A] uppercase tracking-wider mb-3">Works Progress</h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-[#677D6A] mb-1">Works Complete</p>
            <div className="bg-[#F5F7F4] p-3 rounded-lg">
              <p className="text-sm text-[#40534C]">{form?.worksComplete || 'Not specified'}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-[#677D6A] mb-1">Works Ongoing</p>
            <div className="bg-[#F5F7F4] p-3 rounded-lg">
              <p className="text-sm text-[#40534C]">{form?.worksOngoing || 'Not specified'}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-[#677D6A] mb-1">Materials Found on Site</p>
            <div className="bg-[#F5F7F4] p-3 rounded-lg">
              <p className="text-sm text-[#40534C]">{form?.materialsFoundOnSite || 'Not specified'}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-[#677D6A] mb-1">Defects Noted</p>
            <div className="bg-[#F5F7F4] p-3 rounded-lg border-l-2 border-amber-400">
              <p className="text-sm text-[#40534C]">{form?.defectsNotedOnSite || 'No defects noted'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderFinancialTab = (form: any) => (
    <div className="space-y-6 bg-white">
      <div>
        <h2 className="text-xs font-semibold text-[#677D6A] uppercase tracking-wider mb-3 flex items-center gap-2">
          <FiBriefcase className="w-3.5 h-3.5" />
          Financial Summary
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#677D6A]">BQ Amount</p>
            <p className="text-lg font-semibold text-[#1A3636] mt-0.5">{formatCurrency(form?.bqAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-[#677D6A]">Construction Loan</p>
            <p className="text-lg font-semibold text-[#1A3636] mt-0.5">{formatCurrency(form?.constructionLoanAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-[#677D6A]">Customer Contribution</p>
            <p className="text-sm text-[#40534C] mt-0.5">{formatCurrency(form?.customerContribution)}</p>
          </div>
          <div>
            <p className="text-xs text-[#677D6A]">Brief Profile</p>
            <p className="text-sm text-[#40534C] mt-0.5">{form?.briefProfile || '—'}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/20"></div>

      <div>
        <h2 className="text-xs font-semibold text-[#677D6A] uppercase tracking-wider mb-3">Drawdown Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#677D6A]">Drawn Funds D1</p>
            <p className="text-sm text-[#40534C] mt-0.5">{formatCurrency(form?.drawnFundsD1)}</p>
          </div>
          <div>
            <p className="text-xs text-[#677D6A]">Drawn Funds D2</p>
            <p className="text-sm text-[#40534C] mt-0.5">{formatCurrency(form?.drawnFundsD2)}</p>
          </div>
          <div>
            <p className="text-xs text-[#677D6A]">Subtotal Drawn</p>
            <p className="text-sm font-medium text-[#1A3636] mt-0.5">{formatCurrency(form?.drawnFundsSubtotal)}</p>
          </div>
          <div>
            <p className="text-xs text-[#677D6A]">Undrawn Funds</p>
            <p className="text-sm font-medium text-[#1A3636] mt-0.5">{formatCurrency(form?.undrawnFundsToDate)}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/20"></div>

      <div>
        <h2 className="text-xs font-semibold text-[#677D6A] uppercase tracking-wider mb-3">Current Drawdown Request</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#677D6A]">Request Number</p>
            <p className="text-sm text-[#40534C] mt-0.5">{form?.drawdownRequestNo || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[#677D6A]">Amount Requested</p>
            <p className="text-lg font-semibold text-[#1A3636] mt-0.5">{formatCurrency(form?.drawdownKesAmount)}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDocumentsTab = (report: SiteVisitReport, form: any) => {
    const submittedDocs = form?.documentsSubmitted || {}

    return (
      <div className="space-y-6 bg-white">
        <div>
          <h2 className="text-xs font-semibold text-[#677D6A] uppercase tracking-wider mb-3">Submitted Documents</h2>
          <div className="space-y-2">
            {[
              { key: 'qsValuation', label: 'QS Valuation of works done' },
              { key: 'interimCertificate', label: 'Interim Certificate' },
              { key: 'customerInstructionLetter', label: 'Customer Instructions Letter' },
              { key: 'contractorProgressReport', label: "Contractor's Site Progress Report" },
              { key: 'contractorInvoice', label: "Contractor's Invoice" },
            ].map((doc) => {
              const status = submittedDocs[doc.key]
              const fileUrl = submittedDocs[`${doc.key}File`]
              const reason = submittedDocs[`${doc.key}Reason`]

              return (
                <div key={doc.key} className="py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#40534C]">{doc.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status === 'Yes' ? 'bg-emerald-100 text-emerald-700' :
                      status === 'No' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                      {status || 'Not specified'}
                    </span>
                  </div>

                  {status === 'Yes' && fileUrl && (
                    <div className="mt-1 flex items-center gap-2">
                      <FiFile className="w-3 h-3 text-[#677D6A]" />
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        View Document
                        <FiDownload className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}

                  {status === 'No' && reason && (
                    <p className="mt-1 text-xs text-[#677D6A]">{reason}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-[#D6BD98]/20"></div>

        <div>
          <h2 className="text-xs font-semibold text-[#677D6A] uppercase tracking-wider mb-3">Document Sign-off</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-[#677D6A]">Prepared By</p>
              <p className="text-sm text-[#40534C] mt-0.5">{form?.preparedBy || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-[#677D6A]">Signature</p>
              <p className="text-sm text-[#40534C] mt-0.5">{form?.signature || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-[#677D6A]">Date</p>
              <p className="text-sm text-[#40534C] mt-0.5">{form?.preparedDate ? formatNairobiDateTime(form.preparedDate) : '—'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderPhotosTab = (form: any) => {
    const photoSections = [
      { key: 'progressPhotosPage3', title: 'Progress Photos' },
      { key: 'materialsOnSitePhotos', title: 'Materials on Site' },
      { key: 'defectsNotedPhotos', title: 'Defects Noted' },
    ]

    return (
      <div className="space-y-6 bg-white">
        {photoSections.map((section, idx) => {
          const photos = form?.[section.key] || []
          const validPhotos = photos.filter((url: string) => url && url.trim() !== '')

          return (
            <div key={`${section.key}-${idx}`}>
              {idx > 0 && <div className="border-t border-[#D6BD98]/20 my-6"></div>}
              <h2 className="text-xs font-semibold text-[#677D6A] uppercase tracking-wider mb-3">{section.title}</h2>
              {validPhotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {validPhotos.map((url: string, index: number) => (
                    <a
                      key={`${section.key}-${index}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-lg overflow-hidden border border-[#D6BD98]/30 hover:border-[#677D6A] transition-all"
                    >
                      <img
                        src={url}
                        alt={`${section.title} ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-[#D6BD98]/30 rounded-lg">
                  <FiImage className="w-8 h-8 text-[#D6BD98] mx-auto mb-2" />
                  <p className="text-xs text-[#677D6A]">No photos uploaded</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderAuditTab = () => (
    <div className="space-y-3 bg-white">
      <div className="flex items-center gap-3 py-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
        <div>
          <p className="text-xs text-[#677D6A]">Report submitted for review</p>
          <p className="text-xs text-[#40534C] mt-0.5">
            {state.report?.submittedAt ? formatNairobiDateTime(state.report.submittedAt) : '—'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 py-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <div>
          <p className="text-xs text-[#677D6A]">Report created</p>
          <p className="text-xs text-[#40534C] mt-0.5">
            {state.report?.createdAt ? formatNairobiDateTime(state.report.createdAt) : '—'}
          </p>
        </div>
      </div>
    </div>
  )
  // ==================== END RENDER FUNCTIONS ====================

  if (state.isLoading && authLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center py-12">
        <LoadingSpinner size="lg" label="Loading report details..." />
      </div>
    )
  }

  // LOCK DISABLED: Locked by other user view removed
  // if (state.isLockedByOther) { ... }

  if (!state.report) {
    return (
      <div className="min-h-screen bg-white flex justify-center py-12">
        <div className="text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-sm text-[#677D6A]">Report not found</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/qs/reviews')}
            className="mt-4"
          >
            Back to Reviews
          </Button>
        </div>
      </div>
    )
  }

  const report = state.report
  const form = report.siteVisitForm as any
  // LOCK DISABLED: canEdit always true
  // const canEdit = !state.isLockedByOther && state.hasLockedReport
  const canEdit = true // Lock mechanism disabled

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-[#D6BD98]/20 shadow-sm">
        {/* LOCK DISABLED: Lock messages removed */}
        {/* {state.isLockedByOther && ( ... )} */}
        {/* {state.hasLockedReport && !state.isLockedByOther && ( ... )} */}
        
        <div className="px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/qs/reviews')}
                className="p-2 hover:bg-[#D6BD98]/10 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 text-[#40534C]" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-lg font-semibold text-[#1A3636]">
                    {report.reportNo || `CRN-${report.id?.slice(0, 8)}`}
                  </h1>
                  {/* LOCK DISABLED: Lock badge removed */}
                  {/* {state.hasLockedReport && !state.isLockedByOther && ( ... )} */}
                </div>
                <p className="text-xs text-[#677D6A] mt-0.5">
                  {report.customerName} • Submitted {report.submittedAt ? formatDistanceToNow(new Date(report.submittedAt), { addSuffix: true }) : ''}
                </p>
              </div>
            </div>

            {/* Action Buttons - LOCK DISABLED: Always show */}
            {/* {!state.isLockedByOther && state.hasLockedReport && ( ... )} */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, showReworkModal: true }))}
                className="border-amber-500 text-amber-600 hover:bg-amber-50 text-xs h-8"
              >
                <FiXCircle className="w-3.5 h-3.5 mr-1.5" />
                Rework
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, showApproveModal: true }))}
                className="bg-emerald-600 hover:bg-emerald-700 text-xs h-8"
              >
                <FiCheckCircle className="w-3.5 h-3.5 mr-1.5" />
                Approve
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 lg:px-6 border-t border-[#D6BD98]/20">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = state.activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setState(prev => ({ ...prev, activeTab: tab.id }))}
                  className={`
                    flex items-center gap-2 px-4 py-2 text-xs font-medium whitespace-nowrap
                    border-b-2 transition-all
                    ${isActive
                      ? 'border-[#1A3636] text-[#1A3636]'
                      : 'border-transparent text-[#677D6A] hover:text-[#40534C] hover:border-[#D6BD98]'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content - 70/30 Split */}
      <div className="flex flex-col lg:flex-row">
        {/* Left Column - Main Content (70%) */}
        {/* LOCK DISABLED: Removed opacity and pointer-events classes */}
        <div className="lg:w-[70%] px-4 lg:px-6 py-6 bg-white">
          {state.activeTab === 'overview' && renderOverviewTab(report, form)}
          {state.activeTab === 'site-visit' && renderSiteVisitTab(form)}
          {state.activeTab === 'financial' && renderFinancialTab(form)}
          {state.activeTab === 'documents' && renderDocumentsTab(report, form)}
          {state.activeTab === 'photos' && renderPhotosTab(form)}
          {state.activeTab === 'audit' && renderAuditTab()}
        </div>

        {/* Right Column - Comments Sidebar (30%) */}
        {/* LOCK DISABLED: Removed opacity class */}
        <div className="lg:w-[30%] bg-white border-l border-[#D6BD98]/20">
          <div className="sticky top-[120px] h-[calc(100vh-120px)] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#D6BD98]/20 bg-gradient-to-r from-[#1A3636] to-[#40534C]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FiMessageCircle className="w-4 h-4" />
                Comments ({state.comments.length})
              </h3>
            </div>

            {/* Scrollable Comments Container */}
            <div
              ref={commentsContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            >
              {state.comments.length === 0 ? (
                <div className="text-center py-8">
                  <FiMessageSquare className="w-8 h-8 text-[#D6BD98] mx-auto mb-2" />
                  <p className="text-xs text-[#677D6A]">No comments yet</p>
                  <p className="text-xs text-[#677D6A] mt-1">Be the first to add a comment</p>
                </div>
              ) : (
                state.comments.map((comment, index) => {
                  const isCurrentUser = comment.userId === user?.id
                  return (
                    <div
                      key={comment.id || `comment-${index}`}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[90%] rounded-lg p-3 ${
                          isCurrentUser
                            ? 'bg-[#1A3636] text-white'
                            : 'bg-white border border-[#D6BD98]/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold ${isCurrentUser ? 'text-white/90' : 'text-[#1A3636]'}`}>
                            {comment.userName}
                          </span>
                          <span className={`text-[8px] ${isCurrentUser ? 'text-white/60' : 'text-[#677D6A]'}`}>
                            {comment.userRole}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed ${isCurrentUser ? 'text-white/90' : 'text-[#40534C]'}`}>
                          {comment.text}
                        </p>
                        <p className={`text-[8px] mt-1 text-right ${isCurrentUser ? 'text-white/50' : 'text-[#677D6A]'}`}>
                          {formatCompactNairobiDateTime(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Comment Input - LOCK DISABLED: Always show */}
            {/* {!state.isLockedByOther && state.hasLockedReport && ( ... )} */}
            <div className="p-4 border-t border-[#D6BD98]/20 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={state.newComment}
                  onChange={(e) => setState(prev => ({ ...prev, newComment: e.target.value }))}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAddComment()
                    }
                  }}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 text-xs border border-[#D6BD98]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3636]/20"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!state.newComment.trim() || state.isSubmitting}
                  className="px-3 py-2 bg-[#1A3636] text-white rounded-lg hover:bg-[#40534C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rework Modal */}
      {state.showReworkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-[#1A3636] mb-4">Return for Rework</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#40534C] mb-2">
                  Comments <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={state.reworkComment}
                  onChange={(e) => setState(prev => ({ ...prev, reworkComment: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-[#D6BD98]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3636]/20"
                  placeholder="Explain what needs to be changed..."
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleRework}
                  disabled={!state.reworkComment.trim() || state.isSubmitting}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  {state.isSubmitting ? 'Processing...' : 'Return for Rework'}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setState(prev => ({ ...prev, showReworkModal: false, reworkComment: '' }))}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {state.showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-[#1A3636] mb-4">Approve Report</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#40534C] mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={state.approveComment}
                  onChange={(e) => setState(prev => ({ ...prev, approveComment: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-[#D6BD98]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3636]/20"
                  placeholder="Add any notes about this approval..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleApprove}
                  disabled={state.isSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {state.isSubmitting ? 'Processing...' : 'Approve Report'}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setState(prev => ({ ...prev, showApproveModal: false, approveComment: '' }))}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QSReviewDetailPage