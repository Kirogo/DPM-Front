// src/pages/rm/TestReportDetailPage.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/common/Card'
import { useGetChecklistByIdQuery, useUpdateRmChecklistMutation } from '@/services/api/checklistsApi'
import { SiteVisitCallReportForm, Checklist } from '@/types/checklist.types'
import { useAuth } from '@/hooks/useAuth'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import SiteVisitCallReportFormComponent from '@/components/rm/SiteVisitCallReportForm'
import toast from 'react-hot-toast'
import {
  MapPin,
  Camera,
  FileText,
  ArrowLeft,
  Save,
  Send,
  AlertCircle,
  Building2,
  Calendar,
  User,
  Home,
  CheckCircle2,
  HelpCircle,
  FileUp,
  Users,
  FormInput,
  ClipboardList,
  Image,
  Upload,
  Eye,
  Download,
  Edit3,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  DollarSign,
  FileCheck,
  Image as ImageIcon
} from 'lucide-react'

// Initial empty form state matching the database structure
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

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusLower = status?.toLowerCase() || 'pending'
  
  const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    draft: { label: 'Draft', color: 'text-[#40534C]', bgColor: 'bg-[#D6BD98]/20' },
    pending: { label: 'Pending', color: 'text-[#677D6A]', bgColor: 'bg-[#677D6A]/10' },
    pending_qs_review: { label: 'Pending Review', color: 'text-[#1A3636]', bgColor: 'bg-[#D6BD98]/30' },
    pendingqsreview: { label: 'Pending Review', color: 'text-[#1A3636]', bgColor: 'bg-[#D6BD98]/30' },
    submitted: { label: 'Submitted', color: 'text-[#677D6A]', bgColor: 'bg-[#677D6A]/10' },
    approved: { label: 'Approved', color: 'text-white', bgColor: 'bg-[#677D6A]' },
    co_creator_review: { label: 'Co-Creator Review', color: 'text-[#1A3636]', bgColor: 'bg-[#D6BD98]/40' }
  }

  const config = statusConfig[statusLower] || statusConfig.pending

  return (
    <span className={`${config.bgColor} ${config.color} px-2 py-1 rounded-full text-[10px] font-medium`}>
      {config.label}
    </span>
  )
}

// Validation function to check if step is complete
const isStepComplete = (step: number, formData: SiteVisitCallReportForm): boolean => {
  switch (step) {
    case 1: // Customer Info
      return !!(formData.customerName && formData.customerType)
    
    case 2: // Site Visit
      return !!(
        formData.siteVisitDateTime &&
        formData.personMetAtSite &&
        formData.bqAmount &&
        formData.constructionLoanAmount &&
        formData.customerContribution &&
        formData.siteExactLocation
      )
    
    case 3: // Project Info
      return !!(
        formData.worksComplete &&
        formData.worksOngoing &&
        formData.materialsFoundOnSite &&
        formData.defectsNotedOnSite
      )
    
    case 4: // Documents
      return !!(
        formData.preparedBy &&
        formData.signature &&
        formData.preparedDate
      )
    
    case 5: // Photos
      return !!(
        formData.progressPhotosPage3.some(url => url) &&
        formData.materialsOnSitePhotos.some(url => url) &&
        formData.defectsNotedPhotos.some(url => url)
      )
    
    default:
      return false
  }
}

// Check if all steps are complete for final submission
const isAllStepsComplete = (formData: SiteVisitCallReportForm): boolean => {
  return (
    isStepComplete(1, formData) &&
    isStepComplete(2, formData) &&
    isStepComplete(3, formData) &&
    isStepComplete(4, formData) &&
    isStepComplete(5, formData)
  )
}

export const TestReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  const [activeStep, setActiveStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<SiteVisitCallReportForm>(initialFormState)
  const [apiError, setApiError] = useState<string | null>(null)
  
  // Fetch REAL checklist data from API
  const { data: checklist, isLoading, error, refetch } = useGetChecklistByIdQuery(id!, {
    skip: !id,
    refetchOnMountOrArgChange: true
  })
  
  const [updateChecklist] = useUpdateRmChecklistMutation()

  // Steps configuration
  const steps = [
    { id: 1, name: 'Customer Info', icon: Users, description: 'Customer and report details' },
    { id: 2, name: 'Site Visit', icon: MapPin, description: 'Site visit details and amounts' },
    { id: 3, name: 'Project Info', icon: Building2, description: 'Project progress and objectives' },
    { id: 4, name: 'Documents', icon: FileText, description: 'Submit required documents' },
    { id: 5, name: 'Photos', icon: ImageIcon, description: 'Upload site photos' },
  ]

  // Load REAL data from API
  useEffect(() => {
    if (checklist) {
      console.log('Loading real checklist data:', checklist)
      if (checklist.siteVisitForm) {
        setFormData(checklist.siteVisitForm)
      } else {
        // Initialize with basic data from checklist
        setFormData(prev => ({
          ...prev,
          callReportNo: checklist.callReportNo || checklist.dclNo || '',
          customerName: checklist.customerName || '',
          customerType: checklist.customerType || '',
        }))
      }
    }
  }, [checklist])

  // Handle API error
  useEffect(() => {
    if (error) {
      console.error('API Error details:', error)
      
      // Check if it's a 405 error
      if ('status' in error && error.status === 405) {
        setApiError('The API endpoint is not accessible. Please check if the backend is running and the endpoint is correct.')
        toast.error('API endpoint not accessible. Please contact support.')
      } else {
        setApiError('Failed to load report data. Please try again.')
        toast.error('Failed to load report data')
      }
    }
  }, [error])

  const handleFormChange = (updatedForm: SiteVisitCallReportForm) => {
    setFormData(updatedForm)
  }

  const handleSaveDraft = async () => {
  if (!id) return
  
  setIsSubmitting(true)
  try {
    // Get the current checklist data
    const currentChecklist = checklist;
    
    // Prepare the payload - only include fields that have values
    const payload: any = {
      status: 'draft'
    };
    
    // Only add fields if they exist in the current checklist
    if (currentChecklist?.customerNumber) payload.customerNumber = currentChecklist.customerNumber;
    if (currentChecklist?.customerName) payload.customerName = currentChecklist.customerName;
    if (currentChecklist?.customerEmail) payload.customerEmail = currentChecklist.customerEmail;
    if (currentChecklist?.projectName) payload.projectName = currentChecklist.projectName;
    if (currentChecklist?.ibpsNo) payload.ibpsNo = currentChecklist.ibpsNo;
    if (currentChecklist?.assignedToRM?.id || currentChecklist?.assignedToRM?._id) {
      payload.assignedToRM = currentChecklist.assignedToRM.id || currentChecklist.assignedToRM._id;
    }
    if (currentChecklist?.documents) payload.documents = currentChecklist.documents;
    
    // Always include the site visit form data
    payload.siteVisitForm = formData;

    console.log('Saving draft with payload:', payload);

    await updateChecklist({
      id,
      payload
    }).unwrap();
    
    toast.success('Draft saved successfully!');
    refetch();
  } catch (error) {
    console.error('Save draft error:', error);
    toast.error('Failed to save draft');
  } finally {
    setIsSubmitting(false);
  }
};

  const handleSubmit = async () => {
    if (!id) return
    
    // Validate all steps are complete
    if (!isAllStepsComplete(formData)) {
      toast.error('Please complete all steps before submitting')
      
      // Find first incomplete step and navigate to it
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
      await updateChecklist({
        id,
        payload: {
          siteVisitForm: formData,
          status: 'submitted'
        }
      }).unwrap()
      
      toast.success('Report submitted successfully!')
      refetch()
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (activeStep < steps.length) {
      setActiveStep(activeStep + 1)
    }
  }

  const handlePrevious = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1)
    }
  }

  const handleCancel = () => {
    navigate('/rm/test-reports')
  }

  const handleRetry = () => {
    setApiError(null)
    refetch()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A3636]/5 via-white to-[#677D6A]/5">
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
      <div className="min-h-screen bg-gradient-to-br from-[#1A3636]/5 via-white to-[#677D6A]/5">
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
      <div className="min-h-screen bg-gradient-to-br from-[#1A3636]/5 via-white to-[#677D6A]/5">
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

  const displayValue = (checklist?.callReportNo || checklist?.dclNo || '-').replace(/^DCL-/i, 'CRN-')

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A3636]/5 via-white to-[#677D6A]/5">
      {/* Header */}
      <div className="bg-white border-b border-[#D6BD98]/30 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                  <StatusBadge status={checklist?.status || 'pending'} />
                </div>
                <p className="text-sm text-[#40534C]">
                  Step {activeStep} of {steps.length}: {steps[activeStep - 1].name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="px-3 py-1.5 border border-[#677D6A] text-[#40534C] rounded-lg hover:bg-[#D6BD98]/10 transition-colors flex items-center gap-1 text-sm"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              {activeStep === steps.length ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isAllStepsComplete(formData)}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm ${
                    isAllStepsComplete(formData)
                      ? 'bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white hover:shadow-lg'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  Submit
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-3 py-1.5 bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white rounded-lg flex items-center gap-1 text-sm hover:shadow-lg"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Steps - Clickable for navigation */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isComplete = isStepComplete(step.id, formData)
                const isActive = activeStep === step.id
                
                return (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => setActiveStep(step.id)}
                      className="flex items-center focus:outline-none group"
                    >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                          isComplete
                            ? 'bg-[#677D6A] text-white'
                            : isActive
                              ? 'bg-[#1A3636] text-white ring-4 ring-[#D6BD98]/20'
                              : 'bg-[#F5F7F4] border border-[#D6BD98]/30 text-[#40534C] group-hover:border-[#677D6A]'
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <step.icon className="w-4 h-4" />
                        )}
                      </div>
                      <span className={`ml-2 text-xs font-medium hidden sm:block ${
                        isActive ? 'text-[#1A3636]' : 'text-[#677D6A]'
                      }`}>
                        {step.name}
                      </span>
                    </button>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${
                        isComplete ? 'bg-[#677D6A]' : 'bg-[#D6BD98]'
                      }`} />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - Using the SiteVisitCallReportFormComponent */}
          <div className="lg:col-span-2">
            <Card className="border border-[#D6BD98]/20 shadow-lg">
              <div className="p-6">
                <SiteVisitCallReportFormComponent 
                  value={formData} 
                  onChange={handleFormChange}
                  activeStep={activeStep}
                />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border border-[#D6BD98]/20 bg-gradient-to-br from-[#1A3636] to-[#40534C] text-white">
              <div className="p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <HelpCircle className="w-5 h-5 text-[#D6BD98]" />
                  Step Information
                </h3>
                <p className="text-sm text-white/80 mb-4">
                  {steps[activeStep - 1].description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#D6BD98]">Status:</span>
                    <span className={isStepComplete(activeStep, formData) ? 'text-green-400' : 'text-yellow-400'}>
                      {isStepComplete(activeStep, formData) ? '✓ Complete' : '⏳ Incomplete'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#D6BD98]">Created:</span>
                    <span>{checklist?.createdAt ? new Date(checklist.createdAt).toLocaleDateString() : '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#D6BD98]">Last Updated:</span>
                    <span>{checklist?.updatedAt ? new Date(checklist.updatedAt).toLocaleDateString() : '-'}</span>
                  </div>
                </div>

                {/* Progress Summary */}
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex justify-between text-xs mb-2">
                    <span>Overall Progress</span>
                    <span>{Math.round(([1,2,3,4,5].filter(s => isStepComplete(s, formData)).length / 5) * 100)}%</span>
                  </div>
                  <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#D6BD98] rounded-full transition-all duration-300"
                      style={{ width: `${([1,2,3,4,5].filter(s => isStepComplete(s, formData)).length / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/60 mt-2">
                    {[1,2,3,4,5].filter(s => isStepComplete(s, formData)).length} of 5 steps complete
                  </p>
                </div>
              </div>
            </Card>

            {/* Navigation Buttons for Mobile */}
            {isMobile && (
              <div className="flex gap-2">
                {activeStep > 1 && (
                  <button
                    onClick={handlePrevious}
                    className="flex-1 px-4 py-2 border border-[#677D6A] text-[#40534C] rounded-lg flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                )}
                {activeStep < steps.length ? (
                  <button
                    onClick={handleNext}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white rounded-lg flex items-center justify-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!isAllStepsComplete(formData)}
                    className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-1 ${
                      isAllStepsComplete(formData)
                        ? 'bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Submit
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestReportDetailPage