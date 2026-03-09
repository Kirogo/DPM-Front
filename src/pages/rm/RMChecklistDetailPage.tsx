// src/pages/rm/RMChecklistDetailPage.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/common/Card'
import {
  useGetChecklistByIdQuery,
  useUpdateRmChecklistMutation
} from '@/services/api/checklistsApi'
import { SiteVisitCallReportForm } from '@/types/checklist.types'
import { useAuth } from '@/hooks/useAuth'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import SiteVisitCallReportFormComponent from '@/components/rm/SiteVisitCallReportForm'
import PreviewStep from '@/components/rm/PreviewStep'
import axiosInstance from '@/services/api/axiosConfig'
import { Comment } from '@/types/report.types'
import toast from 'react-hot-toast'
import { formatNairobiDateTime, formatCompactNairobiDateTime } from '@/utils/dateUtils'
import { generateSiteVisitReportPDF } from '@/utils/pdfGenerator'
import {
  MapPin,
  FileText,
  ArrowLeft,
  Save,
  Send,
  AlertCircle,
  Building2,
  CheckCircle2,
  HelpCircle,
  Users,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Image as ImageIcon,
  ListCheck,
  MessageCircle,
  Download,
  Eye
} from 'lucide-react'

// Initial empty form state
const initialFormState: SiteVisitCallReportForm = {
  callReportNo: '',
  customerName: '',
  customerType: '',
  siteVisitDateTime: '',
  personMetAtSite: '',
  bqAmount: '',
  constructionLoanAmount: '',
  customerContribution: '',
  drawnFundsD1: '',
  drawnFundsD2: '',
  drawnFundsSubtotal: '',
  undrawnFundsToDate: '',
  briefProfile: '',
  siteExactLocation: '',
  houseLocatedAlong: '',
  sitePin: '',
  securityDetails: '',
  plotLrNo: '',
  siteVisitObjective1: '',
  siteVisitObjective2: '',
  siteVisitObjective3: '',
  worksComplete: '',
  worksOngoing: '',
  materialsFoundOnSite: '',
  defectsNotedOnSite: '',
  drawdownRequestNo: '',
  drawdownKesAmount: '',
  documentsSubmitted: {
    qsValuation: '',
    interimCertificate: '',
    customerInstructionLetter: '',
    contractorProgressReport: '',
    contractorInvoice: ''
  },
  preparedBy: '',
  signature: '',
  preparedDate: '',
  progressPhotosPage3: ['', '', '', ''],
  progressPhotosPage4: ['', '', '', ''],
  materialsOnSitePhotos: ['', '', '', ''],
  defectsNotedPhotos: ['', '', '', '']
}

// Status badge component with new status values
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusLower = status?.toLowerCase() || 'pending'

  const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: { label: 'Pending', color: 'text-[#677D6A]', bgColor: 'bg-[#677D6A]/10' },
    draft: { label: 'Draft', color: 'text-[#40534C]', bgColor: 'bg-[#D6BD98]/20' },
    submitted: { label: 'QS Review', color: 'text-[#1A3636]', bgColor: 'bg-[#D6BD98]/30' },
    rework: { label: 'Rework', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    approved: { label: 'Approved', color: 'text-white', bgColor: 'bg-[#677D6A]' },
    rejected: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-100' },
  }

  const config = statusConfig[statusLower] || statusConfig.pending

  return (
    <span className={`${config.bgColor} ${config.color} px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap`}>
      {config.label}
    </span>
  )
}

// Validation function
const isStepComplete = (step: number, formData: SiteVisitCallReportForm): boolean => {
  switch (step) {
    case 1:
      return !!(formData.customerName && formData.customerType)
    case 2:
      return !!(
        formData.siteVisitDateTime &&
        formData.personMetAtSite &&
        formData.bqAmount &&
        formData.constructionLoanAmount &&
        formData.customerContribution &&
        formData.siteExactLocation
      )
    case 3:
      return !!(
        formData.worksComplete &&
        formData.worksOngoing &&
        formData.materialsFoundOnSite &&
        formData.defectsNotedOnSite
      )
    case 4:
      return !!(
        formData.preparedBy &&
        formData.signature &&
        formData.preparedDate
      )
    case 5:
      return !!(
        formData.progressPhotosPage3.some(url => url && url.trim() !== '') &&
        formData.materialsOnSitePhotos.some(url => url && url.trim() !== '') &&
        formData.defectsNotedPhotos.some(url => url && url.trim() !== '')
      )
    case 6:
      return true
    default:
      return false
  }
}

const isAllStepsComplete = (formData: SiteVisitCallReportForm): boolean => {
  return (
    isStepComplete(1, formData) &&
    isStepComplete(2, formData) &&
    isStepComplete(3, formData) &&
    isStepComplete(4, formData) &&
    isStepComplete(5, formData)
  )
}

// Enhanced helper function to get value with comprehensive case-insensitive access
const getValue = (obj: any, key: string): any => {
  if (!obj) return undefined

  // Try exact match
  if (obj[key] !== undefined && obj[key] !== null) return obj[key]

  // Try PascalCase (first letter capitalized)
  const pascalKey = key.charAt(0).toUpperCase() + key.slice(1)
  if (obj[pascalKey] !== undefined && obj[pascalKey] !== null) return obj[pascalKey]

  // Try all uppercase
  const upperKey = key.toUpperCase()
  if (obj[upperKey] !== undefined && obj[upperKey] !== null) return obj[upperKey]

  // Try the exact property name from the DTO (SiteVisitForm, etc.)
  const exactDtoKey = key === 'siteVisitForm' ? 'SiteVisitForm' :
    key === 'customerName' ? 'CustomerName' :
      key === 'customerNumber' ? 'CustomerNumber' :
        key === 'customerEmail' ? 'CustomerEmail' :
          key === 'projectName' ? 'ProjectName' :
            key === 'ibpsNo' ? 'IbpsNo' :
              key === 'dclNo' ? 'DclNo' :
                key === 'callReportNo' ? 'CallReportNo' : key
  if (obj[exactDtoKey] !== undefined && obj[exactDtoKey] !== null) return obj[exactDtoKey]

  // Check nested properties
  for (const k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      const nested = getValue(obj[k], key)
      if (nested !== undefined) return nested
    }
  }

  return undefined
}

// Helper function to transform comment data
const transformComment = (comment: any): Comment => ({
  id: comment.id || comment._id || '',
  reportId: comment.reportId || comment.ReportId || '',
  userId: comment.userId || comment.UserId || '',
  userName: comment.userName || comment.UserName || 'Unknown',
  userRole: comment.userRole || comment.UserRole || '',
  text: comment.text || comment.Text || '',
  isInternal: comment.isInternal || comment.IsInternal || false,
  createdAt: comment.createdAt || comment.CreatedAt || new Date().toISOString()
})

// Function to extract status from checklist (handles multiple possible locations)
const extractStatus = (checklist: any): string => {
  if (!checklist) return 'pending'
  
  // Check all possible status locations
  const possibleStatusLocations = [
    checklist.status,
    checklist.Status,
    checklist.STATUS,
    checklist.reportStatus,
    checklist.ReportStatus,
    checklist.data?.status,
    checklist.data?.Status,
    checklist.report?.status,
    checklist.report?.Status,
    checklist._doc?.status,
    checklist._doc?.Status
  ]
  
  for (const status of possibleStatusLocations) {
    if (status !== undefined && status !== null) {
      return status.toString().toLowerCase()
    }
  }
  
  return 'pending'
}

// Function to check if a report should be read-only
const isReadOnlyStatus = (status: string): boolean => {
  const lowerStatus = status?.toLowerCase()
  return lowerStatus === 'submitted' || 
         lowerStatus === 'approved' || 
         lowerStatus === 'pending_qs_review' || 
         lowerStatus === 'pendingqsreview' ||
         lowerStatus === 'completed' ||
         lowerStatus === 'under_review' ||
         lowerStatus === 'underreview'
}

export const RMChecklistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const [activeStep, setActiveStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)
  const [formData, setFormData] = useState<SiteVisitCallReportForm>(initialFormState)
  const [apiError, setApiError] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [redirectAttempted, setRedirectAttempted] = useState(false)
  const [reportStatus, setReportStatus] = useState<string>('pending')

  const autoSaveTimer = useRef<NodeJS.Timeout>()

  // Fetch checklist data
  const { data: checklist, isLoading, error, refetch } = useGetChecklistByIdQuery(id!, {
    skip: !id,
    refetchOnMountOrArgChange: true
  })

  const [updateChecklist] = useUpdateRmChecklistMutation()

  // Fetch comments
  useEffect(() => {
    if (id) {
      fetchComments()
    }
  }, [id])

  const fetchComments = async () => {
    setIsLoadingComments(true)
    try {
      const response = await axiosInstance.get(`/qs/reviews/${id}/comments`)
      const fetchedComments = (response.data || []).map(transformComment)
      // Sort with most recent first
      fetchedComments.sort((a: Comment, b: Comment) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setComments(fetchedComments)
    } catch (error) {
      console.log('No comments available')
    } finally {
      setIsLoadingComments(false)
    }
  }

  // Steps configuration
  const steps = [
    { id: 1, name: '1.Customer Info', icon: Users, description: 'Customer and report details' },
    { id: 2, name: '2.Site Visit', icon: MapPin, description: 'Site visit details and amounts' },
    { id: 3, name: '3.Project Info', icon: Building2, description: 'Project progress and objectives' },
    { id: 4, name: '4.Documents', icon: FileText, description: 'Submit required documents' },
    { id: 5, name: '5.Photos', icon: ImageIcon, description: 'Upload site photos' },
    { id: 6, name: '6.Preview', icon: ListCheck, description: 'Review all information before submission' },
  ]

  // Load checklist data and extract status
  useEffect(() => {
    if (checklist) {
      console.log('========== CHECKLIST DATA DEBUG ==========');
      console.log('Full checklist object:', checklist);
      
      // Extract status using our helper function
      const extractedStatus = extractStatus(checklist)
      setReportStatus(extractedStatus)
      
      console.log('Extracted status:', extractedStatus);
      console.log('Status from direct property:', checklist.status);
      console.log('Status from Status property:', checklist.Status);
      console.log('Status from getValue:', getValue(checklist, 'status'));

      // Try all possible locations for form data
      const possibleFormData = [
        checklist.siteVisitForm,
        checklist.SiteVisitForm,
        checklist.siteVisitFormJson,
        checklist.SiteVisitFormJson
      ].filter(Boolean)

      console.log('Possible form data locations:', possibleFormData.length);

      let formDataFound = null

      // Try each possible location
      for (const formSource of possibleFormData) {
        try {
          if (typeof formSource === 'string' && formSource !== 'null') {
            const parsed = JSON.parse(formSource)
            if (parsed && typeof parsed === 'object') {
              formDataFound = parsed
              console.log('Found form data from string:', parsed)
              break
            }
          } else if (formSource && typeof formSource === 'object') {
            formDataFound = formSource
            console.log('Found form data from object:', formSource)
            break
          }
        } catch (e) {
          console.log('Error parsing form source:', e)
        }
      }

      if (formDataFound) {
        console.log('✅ Loading existing site visit form data:', formDataFound);
        console.log('Form fields present:', Object.keys(formDataFound));
        setFormData(formDataFound as SiteVisitCallReportForm);
      } else {
        console.log('⚠️ No site visit form found, populating basic data');
        setFormData(prev => ({
          ...prev,
          callReportNo: getValue(checklist, 'callReportNo') || getValue(checklist, 'dclNo') || '',
          customerName: getValue(checklist, 'customerName') || '',
          customerEmail: getValue(checklist, 'customerEmail') || '',
          projectName: getValue(checklist, 'projectName') || '',
          ibpsNo: getValue(checklist, 'ibpsNo') || '',
        }));
      }
      console.log('==========================================');
    }
  }, [checklist]);

  // CRITICAL: Redirect to read-only view if report is submitted or approved
  useEffect(() => {
    if (checklist && !isLoading && !redirectAttempted) {
      const status = reportStatus
      console.log('Checking status for redirect:', status)
      
      if (isReadOnlyStatus(status)) {
        console.log('🚨 Read-only status detected, redirecting to view page')
        toast.loading('This report is in read-only mode', { duration: 2000 })
        setRedirectAttempted(true)
        navigate(`/rm/reports/${id}/view`, { replace: true })
      } else {
        console.log('✅ Editable status detected, staying on detail page')
      }
    }
  }, [checklist, isLoading, id, navigate, redirectAttempted, reportStatus])

  // Handle API error
  useEffect(() => {
    if (error) {
      console.error('API Error details:', error)
      setApiError('Failed to load report data. Please try again.')
      toast.error('Failed to load report data')
    }
  }, [error])

  const handleFormChange = (updatedForm: SiteVisitCallReportForm) => {
    // Check if report is approved - should not be editable
    if (isReadOnlyStatus(reportStatus)) {
      toast.error('This report is in read-only mode and cannot be edited')
      return
    }

    setFormData(updatedForm)

    // Clear any existing timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }

    // Only auto-save if the user has stopped typing for 90 seconds and report is not read-only
    autoSaveTimer.current = setTimeout(() => {
      if (!isSubmitting && !isSavingDraft && !isReadOnlyStatus(reportStatus)) {
        console.log('Auto-saving draft after inactivity...')
        handleSaveDraft(true)
      }
    }, 90000)
  }

  const handleSaveDraft = async (silent: boolean = false) => {
    if (!id) return

    // Prevent saving draft if report is read-only
    if (isReadOnlyStatus(reportStatus)) {
      toast.error('Cannot save draft: Report is in read-only mode')
      return
    }

    setIsSavingDraft(true)
    try {
      const currentChecklist = checklist;

      const payload: any = {
        status: 'draft'
      };

      // Preserve existing data
      if (getValue(currentChecklist, 'customerNumber')) payload.customerNumber = getValue(currentChecklist, 'customerNumber');
      if (getValue(currentChecklist, 'customerName')) payload.customerName = getValue(currentChecklist, 'customerName');
      if (getValue(currentChecklist, 'customerEmail')) payload.customerEmail = getValue(currentChecklist, 'customerEmail');
      if (getValue(currentChecklist, 'projectName')) payload.projectName = getValue(currentChecklist, 'projectName');
      if (getValue(currentChecklist, 'ibpsNo')) payload.ibpsNo = getValue(currentChecklist, 'ibpsNo');

      const assignedToRM = getValue(currentChecklist, 'assignedToRM');
      if (assignedToRM?.id || assignedToRM?._id) {
        payload.assignedToRM = assignedToRM.id || assignedToRM._id;
      }

      if (getValue(currentChecklist, 'documents')) payload.documents = getValue(currentChecklist, 'documents');

      // CRITICAL: Always include the current form data
      payload.siteVisitForm = formData;

      console.log('Saving draft with form data:', formData);

      await updateChecklist({
        id,
        payload
      }).unwrap();

      if (!silent) {
        toast.success('Draft saved successfully!');
      }
      refetch();
    } catch (error) {
      console.error('Save draft error:', error);
      if (!silent) {
        toast.error('Failed to save draft');
      }
    } finally {
      setIsSavingDraft(false);
    }
  }

  const handleSubmit = async () => {
    if (!id) return

    // Prevent submission if report is read-only
    if (isReadOnlyStatus(reportStatus)) {
      toast.error('Cannot submit: Report is in read-only mode')
      return
    }

    if (!isAllStepsComplete(formData)) {
      toast.error('Please complete all steps before submitting')
      for (let i = 1; i <= 5; i++) {
        if (!isStepComplete(i, formData)) {
          setActiveStep(i)
          break
        }
      }
      return
    }

    setIsSubmitting(true)
    try {
      const currentChecklist = checklist;

      const payload: any = {
        status: 'submitted'
      };

      // Preserve ALL existing data
      if (getValue(currentChecklist, 'customerNumber')) payload.customerNumber = getValue(currentChecklist, 'customerNumber');
      if (getValue(currentChecklist, 'customerName')) payload.customerName = getValue(currentChecklist, 'customerName');
      if (getValue(currentChecklist, 'customerEmail')) payload.customerEmail = getValue(currentChecklist, 'customerEmail');
      if (getValue(currentChecklist, 'projectName')) payload.projectName = getValue(currentChecklist, 'projectName');
      if (getValue(currentChecklist, 'ibpsNo')) payload.ibpsNo = getValue(currentChecklist, 'ibpsNo');

      const assignedToRM = getValue(currentChecklist, 'assignedToRM');
      if (assignedToRM?.id || assignedToRM?._id) {
        payload.assignedToRM = assignedToRM.id || assignedToRM._id;
      }

      if (getValue(currentChecklist, 'documents')) payload.documents = getValue(currentChecklist, 'documents');

      // CRITICAL: Include all form data in submission
      payload.siteVisitForm = formData;

      console.log('Submitting with form data:', formData);

      await updateChecklist({
        id,
        payload
      }).unwrap();

      toast.success('Report submitted successfully!');

      // Navigate back to the reports page
      navigate('/rm/reports')

    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDownloadPDF = async () => {
    if (!id || !formData) return

    setIsDownloadingPDF(true)
    try {
      const reportNumber = getValue(checklist, 'callReportNo') || getValue(checklist, 'dclNo') || 'CRN-000'
      const formattedReportNumber = reportNumber.replace(/^DCL-/i, 'CRN-')

      // Get approver info if status is approved
      const approvedBy = reportStatus === 'approved'
        ? checklist?.approvedBy || checklist?.ApprovedBy || 'QS Officer'
        : undefined

      const approvalDate = reportStatus === 'approved'
        ? checklist?.approvedAt || checklist?.ApprovedAt
        : undefined

      const doc = generateSiteVisitReportPDF(
        formData,
        formattedReportNumber,
        approvedBy,
        approvalDate
      )

      // Save the PDF
      doc.save(`Site_Visit_Report_${formattedReportNumber}_${new Date().toISOString().split('T')[0]}.pdf`)

      toast.success('PDF downloaded successfully!')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    } finally {
      setIsDownloadingPDF(false)
    }
  }

  const handleNext = () => {
    if (isReadOnlyStatus(reportStatus)) {
      toast.error('Cannot navigate: Report is in read-only mode')
      return
    }
    if (activeStep < steps.length) {
      setActiveStep(activeStep + 1)
    }
  }

  const handlePrevious = () => {
    if (isReadOnlyStatus(reportStatus)) {
      toast.error('Cannot navigate: Report is in read-only mode')
      return
    }
    if (activeStep > 1) {
      setActiveStep(activeStep - 1)
    }
  }

  const handleCancel = () => {
    navigate('/rm/reports')
  }

  const handleRetry = () => {
    setApiError(null)
    refetch()
  }

  const handleEditStep = (stepId: number) => {
    // Prevent editing if report is read-only
    if (isReadOnlyStatus(reportStatus)) {
      toast.error('Cannot edit: Report is in read-only mode')
      return
    }
    setActiveStep(stepId)
  }

  // Get visible steps for mobile
  const getMobileVisibleSteps = () => {
    if (!isMobile) return steps;

    const prevStep = activeStep > 1 ? steps[activeStep - 2] : null;
    const currentStep = steps[activeStep - 1];
    const nextStep = activeStep < steps.length ? steps[activeStep] : null;

    return [prevStep, currentStep, nextStep].filter(Boolean);
  };

  // Check if report is approved
  const isApproved = reportStatus === 'approved'

  // Check if report is submitted (QS Review)
  const isSubmitted = reportStatus === 'submitted' || 
                     reportStatus === 'pending_qs_review' || 
                     reportStatus === 'pendingqsreview' ||
                     reportStatus === 'under_review'

  // Determine if form should be editable
  const isEditable = !isReadOnlyStatus(reportStatus)

  // If redirecting, show loading state
  if (redirectAttempted && (isApproved || isSubmitted)) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#677D6A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#40534C]">Redirecting to read-only view...</p>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-[#D6BD98]/20 rounded-lg w-1/3"></div>
            <div className="h-64 bg-[#D6BD98]/10 rounded-lg"></div>
            <div className="h-32 bg-[#D6BD98]/10 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (apiError || error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[#1A3636] mb-2">Failed to Load Report</h2>
            <p className="text-sm text-[#40534C] mb-4">{apiError || 'Unable to fetch report data. Please try again.'}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white rounded-lg text-sm flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-[#677D6A] text-[#40534C] rounded-lg text-sm"
              >
                Go Back
              </button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // No data state
  if (!checklist) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[#1A3636] mb-2">Report Not Found</h2>
            <p className="text-sm text-[#40534C] mb-4">The requested report could not be found.</p>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white rounded-lg text-sm"
            >
              Go Back
            </button>
          </Card>
        </div>
      </div>
    )
  }

  const displayValue = (getValue(checklist, 'callReportNo') || getValue(checklist, 'dclNo') || '-').replace(/^DCL-/i, 'CRN-')
  const allComplete = isAllStepsComplete(formData)
  const mobileVisibleSteps = getMobileVisibleSteps();
  const isReworkRequired = reportStatus === 'rework';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-[#D6BD98]/30 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Rework Banner - Only show if not approved and not submitted */}
          {isReworkRequired && !isApproved && !isSubmitted && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-800">Rework Required</p>
                  <p className="text-xs text-amber-700 mt-1">
                    QS has requested changes. Please check the comments on the right and make the necessary updates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* QS Review Banner */}
          {isSubmitted && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-blue-800">Under QS Review</p>
                  <p className="text-xs text-blue-700 mt-1">
                    This report is under QS review and cannot be edited.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Approved Banner */}
          {isApproved && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-green-800">Report Approved</p>
                  <p className="text-xs text-green-700 mt-1">
                    This report has been approved and is now in read-only mode. You can download the PDF for your records.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Header */}
          {isMobile ? (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <button
                  onClick={handleCancel}
                  className="p-1.5 hover:bg-[#D6BD98]/20 rounded-lg transition-colors flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-[#40534C]" />
                </button>
                <h1 className="text-[11px] font-bold text-[#1A3636] truncate">
                  {displayValue}
                </h1>
                <StatusBadge status={reportStatus} />
              </div>

              {/* Mobile action buttons - conditional based on status */}
              {(isApproved || isSubmitted) ? (
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloadingPDF}
                  className="px-2 py-1 bg-[#677D6A] text-white rounded-lg hover:bg-[#40534C] transition-colors flex items-center gap-1 text-[9px] flex-shrink-0"
                >
                  <Download className="w-3 h-3" />
                  {isDownloadingPDF ? 'Downloading...' : 'PDF'}
                </button>
              ) : (
                <button
                  onClick={() => handleSaveDraft(false)}
                  disabled={isSavingDraft || isSubmitting || !isEditable}
                  className={`px-2 py-1 border border-[#677D6A] text-[#40534C] rounded-lg hover:bg-[#D6BD98]/10 transition-colors flex items-center gap-1 text-[9px] flex-shrink-0 ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Save className="w-3 h-3" />
                  {isSavingDraft ? 'Saving...' : 'Draft'}
                </button>
              )}
            </div>
          ) : (
            /* Desktop Header */
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-[#D6BD98]/20 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-[#40534C]" />
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-[#1A3636]">
                      {displayValue}
                    </h1>
                    <StatusBadge status={reportStatus} />
                  </div>
                  <p className="text-sm text-[#40534C]">
                    {isApproved ? 'Approved Report (Read Only)' : 
                     isSubmitted ? 'Under QS Review (Read Only)' : 
                     `Step ${activeStep} of ${steps.length}: ${steps[activeStep - 1].name}`}
                  </p>
                </div>
              </div>

              {/* Desktop action buttons - conditional based on status */}
              <div className="flex items-center gap-2">
                {(isApproved || isSubmitted) ? (
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloadingPDF}
                    className="px-3 py-1.5 bg-[#677D6A] text-white rounded-lg hover:bg-[#40534C] transition-colors flex items-center gap-1 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    {isDownloadingPDF ? 'Downloading...' : 'Download PDF'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleSaveDraft(false)}
                      disabled={isSavingDraft || isSubmitting || !isEditable}
                      className={`px-3 py-1.5 border border-[#677D6A] text-[#40534C] rounded-lg hover:bg-[#D6BD98]/10 transition-colors flex items-center gap-1 text-sm ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Save className="w-4 h-4" />
                      {isSavingDraft ? 'Saving...' : 'Save Draft'}
                    </button>

                    {activeStep === steps.length ? (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !allComplete || !isEditable}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm ${allComplete && isEditable
                          ? 'bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white hover:shadow-lg'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                      >
                        <Send className="w-4 h-4" />
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        disabled={!isEditable}
                        className={`px-3 py-1.5 bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white rounded-lg flex items-center gap-1 text-sm hover:shadow-lg ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Progress Steps - Hide if approved or submitted */}
          {!isApproved && !isSubmitted && (
            <div className="mt-4">
              {isMobile ? (
                <div className="flex items-center justify-between">
                  {mobileVisibleSteps.map((step, index) => {
                    const isComplete = isStepComplete(step.id, formData);
                    const isActive = activeStep === step.id;
                    const isPreviewStep = step.id === 6;

                    return (
                      <React.Fragment key={step.id}>
                        <button
                          onClick={() => setActiveStep(step.id)}
                          disabled={!isEditable}
                          className={`flex flex-col items-center focus:outline-none group flex-1 ${!isEditable ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                          <div
                            className={`flex items-center justify-center w-9 h-9 rounded-full transition-all ${isPreviewStep
                              ? allComplete
                                ? 'bg-gradient-to-r from-[#A58560] to-[#C0A47C] text-white shadow-lg shadow-[#D4AF37]/20'
                                : 'bg-gradient-to-r from-[#A58560] to-[#C0A47C] text-white'
                              : isComplete
                                ? 'bg-[#677D6A] text-white'
                                : isActive
                                  ? 'bg-[#1A3636] text-white ring-4 ring-[#D6BD98]/20'
                                  : 'bg-[#F5F7F4] border border-[#D6BD98]/30 text-[#40534C] group-hover:border-[#677D6A]'
                              }`}
                          >
                            {isPreviewStep ? (
                              allComplete ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <step.icon className="w-4 h-4" />
                              )
                            ) : isComplete ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <step.icon className="w-4 h-4" />
                            )}
                          </div>
                          <span className={`mt-1 text-[8px] font-medium text-center ${isActive ? 'text-[#1A3636]' : 'text-[#677D6A]'
                            }`}>
                            {step.name}
                          </span>
                        </button>
                        {index < mobileVisibleSteps.length - 1 && (
                          <div className="flex-1 h-0.5 mx-1 bg-[#D6BD98]" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => {
                    const isComplete = isStepComplete(step.id, formData);
                    const isActive = activeStep === step.id;
                    const isPreviewStep = step.id === 6;

                    return (
                      <React.Fragment key={step.id}>
                        <button
                          onClick={() => setActiveStep(step.id)}
                          disabled={!isEditable}
                          className={`flex items-center focus:outline-none group ${!isEditable ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${isPreviewStep
                              ? allComplete
                                ? 'bg-gradient-to-r from-[#A58560] to-[#C0A47C] text-white shadow-lg shadow-[#D4AF37]/20'
                                : 'bg-gradient-to-r from-[#A58560] to-[#C0A47C] text-white'
                              : isComplete
                                ? 'bg-[#677D6A] text-white'
                                : isActive
                                  ? 'bg-[#1A3636] text-white ring-4 ring-[#D6BD98]/20'
                                  : 'bg-[#F5F7F4] border border-[#D6BD98]/30 text-[#40534C] group-hover:border-[#677D6A]'
                              }`}
                          >
                            {isPreviewStep ? (
                              allComplete ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <step.icon className="w-4 h-4" />
                              )
                            ) : isComplete ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <step.icon className="w-4 h-4" />
                            )}
                          </div>
                          <span className={`ml-2 text-xs font-medium hidden sm:block ${isActive ? 'text-[#1A3636]' : 'text-[#677D6A]'
                            }`}>
                            {step.name}
                          </span>
                        </button>
                        {index < steps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-2 ${index < activeStep - 1 || (index < steps.length - 1 && isStepComplete(step.id + 1, formData))
                            ? 'bg-[#677D6A]'
                            : 'bg-[#D6BD98]'
                            }`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Mobile action buttons - conditional */}
          {isMobile && !isApproved && !isSubmitted && (
            <div className="mt-4 flex items-center gap-2">
              {activeStep > 1 && (
                <button
                  onClick={handlePrevious}
                  disabled={!isEditable}
                  className={`flex-1 px-2 py-2 border border-[#677D6A] text-[#40534C] rounded-lg flex items-center justify-center gap-1 text-xs ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
              )}
              {activeStep === steps.length ? (
                <button
                  onClick={handleSubmit}
                  disabled={!allComplete || isSubmitting || !isEditable}
                  className={`flex-1 px-2 py-2 rounded-lg flex items-center justify-center gap-1 text-xs ${allComplete && isEditable
                    ? 'bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!isEditable}
                  className={`flex-1 px-2 py-2 bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white rounded-lg flex items-center justify-center gap-1 text-xs ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - 70/30 Split */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Main Form (70%) */}
          <div className="lg:w-[70%]">
            <Card className="border border-[#D6BD98]/20 shadow-lg">
              <div className="p-6">
                {activeStep === 6 ? (
                  <PreviewStep
                    formData={formData}
                    onEditStep={handleEditStep}
                    isReadOnly={!isEditable}
                  />
                ) : (
                  <SiteVisitCallReportFormComponent
                    value={formData}
                    onChange={handleFormChange}
                    activeStep={activeStep}
                    isReadOnly={!isEditable}
                  />
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Comments Sidebar (30%) */}
          <div className="lg:w-[30%]">
            <div className="sticky top-[120px] bg-white border border-[#D6BD98]/20 rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b border-[#D6BD98]/20 bg-gradient-to-r from-[#1A3636] to-[#40534C]">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Comments ({comments.length})
                </h3>
                {isReworkRequired && !isApproved && !isSubmitted && (
                  <p className="text-[10px] text-amber-200 mt-1">
                    QS has requested changes. Review comments below.
                  </p>
                )}
              </div>

              {/* Scrollable Comments Container */}
              <div
                className="h-[500px] overflow-y-auto p-4 space-y-3"
                style={{ maxHeight: 'calc(100vh - 250px)' }}
              >
                {isLoadingComments ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-[#677D6A] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-8 h-8 text-[#D6BD98] mx-auto mb-2" />
                    <p className="text-xs text-[#677D6A]">No comments yet</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="py-2 border-b border-[#D6BD98]/10 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#1A3636]">
                            {comment.userName}
                          </span>
                          <span className="text-[8px] text-[#677D6A]">
                            • {comment.userRole?.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[8px] text-[#677D6A] whitespace-nowrap">
                          {formatCompactNairobiDateTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-[#40534C] leading-relaxed whitespace-pre-wrap">
                        {comment.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RMChecklistDetailPage