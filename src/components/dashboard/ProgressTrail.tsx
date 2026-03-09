// src/components/dashboard/ProgressTrail.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteVisitReport } from '@/types/report.types'
import { 
  FiUsers, 
  FiFileText, 
  FiMapPin, 
  FiImage, 
  FiUpload, 
  FiEye, 
  FiSend,
  FiChevronRight,
  FiClock,
  FiUser,
  FiBriefcase,
  FiCalendar,
  FiArrowDown,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi'

interface ProgressTrailProps {
  reports?: SiteVisitReport[]
  isLoading?: boolean
}

const stepIcons = {
  1: FiUsers,
  2: FiMapPin,
  3: FiBriefcase,
  4: FiImage,
  5: FiFileText,
  6: FiEye,
  7: FiSend
}

const stepNames = {
  1: 'Customer Info',
  2: 'Site Visit',
  3: 'Project Info',
  4: 'Photos',
  5: 'Documents',
  6: 'Review',
  7: 'Submitted'
}

const stepColors = {
  1: 'from-[#1A3636] to-[#40534C]',
  2: 'from-[#1A3636] to-[#40534C]',
  3: 'from-[#1A3636] to-[#40534C]',
  4: 'from-[#1A3636] to-[#40534C]',
  5: 'from-[#1A3636] to-[#40534C]',
  6: 'from-[#1A3636] to-[#40534C]',
  7: 'from-[#677D6A] to-[#95A89B]'
}

// Helper function to calculate current step based on form data
const calculateCurrentStep = (report: SiteVisitReport): number => {
  // If status is submitted or rework, they're at step 7
  if (report.status === 'submitted' || report.status === 'rework' || report.status === 'approved') {
    return 7
  }
  
  // If no siteVisitForm, they're at step 1
  if (!report.siteVisitForm) {
    return 1
  }
  
  const form = report.siteVisitForm as any
  
  // Check each step's completion
  // Step 2: Site Visit - check if site visit details are filled
  if (form.siteVisitDateTime || form.personMetAtSite || form.siteExactLocation) {
    // Step 3: Project Info - check if project details are filled
    if (form.worksComplete || form.worksOngoing || form.materialsFoundOnSite) {
      // Step 4: Photos - check if any photos uploaded
      if (form.progressPhotosPage3?.some((url: string) => url) ||
          form.materialsOnSitePhotos?.some((url: string) => url) ||
          form.defectsNotedPhotos?.some((url: string) => url)) {
        // Step 5: Documents - check if documents section started
        if (form.preparedBy || form.signature) {
          // Step 6: Review - they're at preview step
          return 6
        }
        return 5
      }
      return 4
    }
    return 3
  }
  
  return 2
}

// Get step name based on current step
const getStepName = (step: number): string => {
  return stepNames[step as keyof typeof stepNames] || 'Draft'
}

// Format date for display
const formatDate = (date?: Date | string): string => {
  if (!date) return 'Unknown'
  try {
    const d = new Date(date)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return 'Unknown'
  }
}

export const ProgressTrail: React.FC<ProgressTrailProps> = ({ 
  reports = [],
  isLoading = false 
}) => {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="bg-white border border-[#D6BD98]/20 rounded-lg overflow-hidden">
        <div className="px-3 py-2 border-b border-[#D6BD98]/20 bg-[#F5F7F4]">
          <div className="h-4 bg-[#D6BD98]/20 rounded w-24 animate-pulse"></div>
        </div>
        <div className="divide-y divide-[#D6BD98]/10">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 bg-[#D6BD98]/20 rounded w-1/3 animate-pulse"></div>
                  <div className="h-3 bg-[#D6BD98]/20 rounded w-12 animate-pulse"></div>
                </div>
                <div className="h-1.5 bg-[#D6BD98]/20 rounded w-full animate-pulse"></div>
                <div className="flex justify-between">
                  <div className="h-2 bg-[#D6BD98]/20 rounded w-16 animate-pulse"></div>
                  <div className="h-2 bg-[#D6BD98]/20 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="bg-white border border-[#D6BD98]/20 rounded-lg p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#D6BD98]/10 flex items-center justify-center">
          <FiBriefcase className="w-6 h-6 text-[#677D6A]" />
        </div>
        <p className="text-sm font-medium text-[#1A3636]">No reports in progress</p>
        <p className="text-[10px] text-[#677D6A] mt-1">Create a new report to get started</p>
        <button
          onClick={() => navigate('/rm/checklists?newCallReport=1')}
          className="mt-3 text-[10px] bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white px-3 py-1.5 rounded-lg hover:shadow-md transition-shadow"
        >
          New Call Report
        </button>
      </div>
    )
  }

  // Filter for reports that are not approved
  const activeReports = reports
    .filter(r => r.status !== 'approved' && r.status !== 'rejected')
    .slice(0, 3)
  
  const hasMoreReports = reports.length > 3

  return (
    <div className="bg-white border border-[#D6BD98]/20 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#D6BD98]/20 bg-[#F5F7F4]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FiClock className="w-3.5 h-3.5 text-[#677D6A]" />
            <h2 className="text-xs font-semibold text-[#1A3636]">Progress Trail</h2>
          </div>
          <button
            onClick={() => navigate('/rm/reports')}
            className="text-[9px] text-[#677D6A] hover:text-[#1A3636] flex items-center gap-0.5 transition-colors"
          >
            View all ({reports.length})
            <FiChevronRight className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="divide-y divide-[#D6BD98]/10">
        {activeReports.length === 0 ? (
          <div className="p-4 text-center">
            <FiCheckCircle className="w-6 h-6 text-[#677D6A] mx-auto mb-2" />
            <p className="text-xs text-[#40534C]">No active reports</p>
          </div>
        ) : (
          activeReports.map((report) => {
            const currentStep = calculateCurrentStep(report)
            const progress = Math.round((currentStep / 7) * 100)
            const StepIcon = stepIcons[currentStep as keyof typeof stepIcons] || FiFileText
            const stepName = getStepName(currentStep)
            
            // Extract report number - try multiple possible fields
            const reportNo = report.reportNo || 
                            (report as any).dclNo || 
                            (report as any).callReportNo || 
                            (report as any).DclNo || 
                            (report as any).CallReportNo || 
                            ''
            
            // Extract project name - try multiple possible fields
            const projectName = report.projectName || 
                                report.title || 
                                (report as any).loanType || 
                                (report as any).ProjectName || 
                                'Untitled'
            
            // Extract customer name - try multiple possible fields
            const customerName = report.customerName || 
                                 report.clientName || 
                                 (report as any).CustomerName || 
                                 (report as any).client?.name || 
                                 'Unknown Client'
            
            // Get RM name from assignedToRM object or rmName field
            let rmName = ''
            if (report.assignedToRM?.name) {
              rmName = report.assignedToRM.name
            } else if (report.rmName) {
              rmName = report.rmName
            } else if (report.rm?.name) {
              rmName = report.rm.name
            }
            
            // Get QS name who returned for rework
            let qsName = ''
            if (report.assignedToQSName) {
              qsName = report.assignedToQSName
            } else if (report.assignedToQS) {
              qsName = report.assignedToQS
            }
            
            const lastUpdated = formatDate(report.updatedAt || report.createdAt)
            const isRework = report.status === 'rework' || report.status === 'returned' || report.status === 'revision_requested'

            // Format the display title
            let displayTitle = ''
            if (reportNo && projectName !== 'Untitled') {
              displayTitle = `${reportNo} · ${projectName}`
            } else if (reportNo) {
              displayTitle = reportNo
            } else {
              displayTitle = projectName
            }

            return (
              <div
                key={report.id}
                className="group hover:bg-[#D6BD98]/5 transition-colors cursor-pointer p-3"
                onClick={() => navigate(`/rm/checklists/${report.id}`)}
              >
                {/* Header with title and step */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-[#1A3636] truncate flex items-center gap-1">
                      {displayTitle}
                      {isRework && (
                        <span className="px-1 py-0.5 bg-orange-100 text-orange-700 text-[6px] rounded-full whitespace-nowrap">
                          Rework
                        </span>
                      )}
                    </h3>
                    <p className="text-[9px] text-[#40534C] mt-0.5 truncate">
                      {customerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${stepColors[currentStep]} flex items-center justify-center`}>
                      <StepIcon className="w-2 h-2 text-white" />
                    </div>
                    <span className="text-[8px] font-medium text-[#1A3636] whitespace-nowrap">
                      Step {currentStep}/7
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-[7px] mb-0.5">
                    <span className="text-[#677D6A]">{stepName}</span>
                    <span className="font-medium text-[#1A3636]">{progress}%</span>
                  </div>
                  <div className="h-1 bg-[#D6BD98]/20 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${stepColors[currentStep]}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 text-[8px] text-[#677D6A]">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      <FiCalendar className="w-2.5 h-2.5" />
                      <span>{lastUpdated}</span>
                    </div>
                    {rmName && (
                      <div className="flex items-center gap-0.5">
                        <FiUser className="w-2.5 h-2.5" />
                        <span className="truncate max-w-[60px]">{rmName}</span>
                      </div>
                    )}
                    {isRework && qsName && (
                      <div className="flex items-center gap-0.5 text-amber-600">
                        <span className="text-[7px]">by {qsName}</span>
                      </div>
                    )}
                  </div>
                  {isRework && !qsName && (
                    <div className="flex items-center gap-0.5 text-amber-600">
                      <FiAlertCircle className="w-2.5 h-2.5" />
                      <span>Rework</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Summary Footer */}
      {reports.length > 0 && (
        <div className="px-3 py-2 border-t border-[#D6BD98]/20 bg-[#F5F7F4]">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs font-semibold text-[#1A3636]">
                {reports.filter(r => r.status === 'submitted').length}
              </p>
              <p className="text-[7px] text-[#677D6A] uppercase">QS Review</p>
            </div>
            <div className="border-x border-[#D6BD98]/20">
              <p className="text-xs font-semibold text-[#1A3636]">
                {reports.filter(r => r.status === 'rework' || r.status === 'returned' || r.status === 'revision_requested').length}
              </p>
              <p className="text-[7px] text-[#677D6A] uppercase">Rework</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1A3636]">
                {reports.filter(r => r.status === 'approved').length}
              </p>
              <p className="text-[7px] text-[#677D6A] uppercase">Approved</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}