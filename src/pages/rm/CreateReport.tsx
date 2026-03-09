// src/pages/rm/CreateReport.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReportForm } from '@/components/reports/ReportForm'
import { Card } from '@/components/common/Card'
import { useReports } from '@/hooks/useReports'
import { useAuth } from '@/hooks/useAuth'
import { CreateReportDto, ReportPhoto, WorkProgress, Issue } from '@/types/report.types'
import { GeotagData } from '@/types/geotag.types'
import { useMediaQuery } from '@/hooks/useMediaQuery'
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
  Eye
} from 'lucide-react'

export const CreateReport: React.FC = () => {
  const navigate = useNavigate()
  const { createReport, uploadPhotos } = useReports()
  const { user } = useAuth()
  const [activeStep, setActiveStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const steps = [
    { id: 1, name: 'Personal Info', icon: Users, description: 'Your personal details' },
    { id: 2, name: 'Form', icon: FormInput, description: 'Fill in the form' },
    { id: 3, name: 'Site Visit', icon: MapPin, description: 'Visit location details' },
    { id: 4, name: 'Photos', icon: Image, description: 'Upload site photos' },
    { id: 5, name: 'Docs', icon: FileUp, description: 'Upload documents' },
    { id: 6, name: 'Review', icon: Eye, description: 'Review your information' },
    { id: 7, name: 'Submit', icon: Send, description: 'Final submission' },
  ]

  // Calculate progress based on actual step completion
  // Step 1 = 14%, Step 2 = 28%, Step 3 = 42%, Step 4 = 57%, Step 5 = 71%, Step 6 = 85%, Step 7 = 100%
  const calculateProgress = () => {
    if (activeStep === 1) return 0 // Start at 0% for step 1
    return Math.round(((activeStep - 1) / 6) * 100) // 6 steps after step 1
  }

  // Get visible steps for mobile carousel - shows previous, current, and next 2 steps
  const getMobileVisibleSteps = () => {
    const visibleSteps = []
    
    // Add previous step if exists (always show 1 previous)
    if (activeStep > 1) {
      visibleSteps.push({ ...steps[activeStep - 2], status: 'previous' })
    }
    
    // Always show current step
    visibleSteps.push({ ...steps[activeStep - 1], status: 'current' })
    
    // Add next 2 steps if they exist
    for (let i = 1; i <= 2; i++) {
      const nextStepIndex = activeStep - 1 + i
      if (nextStepIndex < steps.length) {
        visibleSteps.push({ ...steps[nextStepIndex], status: 'next' })
      }
    }
    
    return visibleSteps
  }

  const mobileVisibleSteps = getMobileVisibleSteps()

  const generateReportNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `SVR-${year}${month}-${random}`
  }

  const handleSubmit = async (
    data: Omit<CreateReportDto, 'workProgress' | 'issues' | 'photos' | 'attachments'>, 
    workProgress: Omit<WorkProgress, 'id'>[],
    issues: Omit<Issue, 'id'>[],
    photoFiles: File[],
    attachmentFiles: File[],
    isDraft?: boolean
  ) => {
    setIsSubmitting(true)
    try {
      const reportData: CreateReportDto = {
        title: data.title || `Site Visit Report - ${data.clientId || 'New'}`,
        description: data.description,
        clientId: data.clientId,
        visitDate: data.visitDate || new Date(),
        siteAddress: data.siteAddress,
        siteCoordinates: data.siteCoordinates,
        weather: data.weather,
        temperature: data.temperature,
        projectName: data.projectName,
        workProgress: workProgress,
        issues: issues,
        loanType: data.loanType,
        ibpsNo: data.ibpsNo,
        rmId: user?.id,
        documents: data.documents || []
      }
      
      const report = await createReport(reportData)

      if (photoFiles.length > 0 && report.id) {
        const geotaggedPhotos: ReportPhoto[] = await Promise.all(
          photoFiles.map(async (file) => {
            const geotag: GeotagData = {
              latitude: 0,
              longitude: 0,
              accuracy: 0,
              timestamp: new Date()
            }

            return {
              id: Math.random().toString(),
              url: URL.createObjectURL(file),
              thumbnailUrl: URL.createObjectURL(file),
              caption: `Site photo - ${new Date().toLocaleString()}`,
              geotag,
              uploadedAt: new Date(),
              uploadedBy: user?.id || '',
              isPrimary: false,
              category: 'site'
            }
          })
        )

        await uploadPhotos(report.id, geotaggedPhotos, photoFiles)
      }

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span>Report created successfully!</span>
        </div>
      )
      
      navigate(`/rm/reports/${report.id}`)
    } catch (error) {
      console.error('Create report error:', error)
      const msg = (error as any)?.message || 'Failed to create report'
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span>{msg}</span>
        </div>
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/rm/reports')
  }

  const progress = calculateProgress()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A3636]/5 via-white to-[#677D6A]/5">
      {/* Mobile Header with Step Carousel - Shows previous, current, and next 2 steps */}
      {isMobile && (
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#D6BD98]/30 shadow-sm">
          <div className="px-4 py-2">
            {/* Top row with back button, title and action buttons */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="p-1.5 hover:bg-[#D6BD98]/20 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-[#40534C]" />
                </button>
                <div>
                  <h1 className="text-base font-semibold text-[#1A3636]">Fill In The Forms</h1>
                  <p className="text-xs text-[#677D6A]">Step {activeStep} of 7</p>
                </div>
              </div>

              {/* Action buttons in header - smaller, aligned right */}
              <div className="flex items-center gap-1.5">
                <button
                  type="submit"
                  form="report-form"
                  name="action"
                  value="draft"
                  disabled={isSubmitting}
                  className="px-2.5 py-1.5 border border-[#677D6A] text-[#40534C] rounded-lg hover:bg-[#D6BD98]/10 transition-colors flex items-center gap-1 disabled:opacity-50 text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Draft</span>
                </button>
                <button
                  type="submit"
                  form="report-form"
                  name="action"
                  value="submit"
                  disabled={isSubmitting || activeStep < 7}
                  className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-50 shadow-sm text-xs ${
                    activeStep === 7
                      ? 'bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Submit</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step Carousel - Not clickable */}
            <div className="flex items-center justify-center gap-1 px-2 mb-2">
              {mobileVisibleSteps.map((step, index) => {
                const isCurrent = step.status === 'current'
                const isPrevious = step.status === 'previous'
                const isNext = step.status === 'next'
                
                // Determine size and opacity based on position
                let size = 'w-10 h-10'
                let iconSize = 'w-4 h-4'
                let opacity = 'opacity-100'
                let ring = ''
                
                if (isCurrent) {
                  size = 'w-10 h-10'
                  iconSize = 'w-5 h-5'
                  ring = 'ring-4 ring-[#D6BD98]/20'
                } else if (isPrevious) {
                  size = 'w-9 h-9'
                  iconSize = 'w-3.5 h-3.5'
                  opacity = 'opacity-70'
                } else if (isNext) {
                  size = 'w-9 h-9'
                  iconSize = 'w-3.5 h-3.5'
                  opacity = 'opacity-50'
                }
                
                return (
                  <React.Fragment key={step.id}>
                    {/* Step indicator - NOT clickable */}
                    <div className="flex flex-col items-center">
                      <div className={`
                        ${size} rounded-full flex items-center justify-center transition-all
                        ${isCurrent 
                          ? 'bg-gradient-to-br from-[#1A3636] to-[#40534C] text-white scale-110 shadow-lg' 
                          : 'bg-[#F5F7F4] border-2 border-[#D6BD98]/30 text-[#40534C]'
                        }
                        ${opacity} ${ring}
                      `}>
                        <step.icon className={iconSize} />
                      </div>
                      
                      {/* Step number indicator */}
                      <span className={`
                        text-[10px] mt-1 font-medium
                        ${isCurrent ? 'text-[#1A3636] font-semibold' : 'text-[#677D6A]'}
                      `}>
                        {step.id}
                      </span>
                    </div>

                    {/* Connector line between steps - only if not last */}
                    {index < mobileVisibleSteps.length - 1 && (
                      <div className="flex-1 max-w-[80px]">
                        <div className="h-0.5 bg-[#D6BD98]/30 rounded-full" />
                      </div>
                    )}
                  </React.Fragment>
                )
              })}
            </div>

            {/* Current step description */}
            <div className="text-center mb-2">
              <p className="text-xs font-medium text-[#1A3636]">
                {activeStep}. {steps[activeStep - 1].name}
              </p>
            </div>

            {/* Progress bar - shows 0% on step 1 */}
            <div className="mt-1">
              <div className="flex justify-between text-[10px] text-[#677D6A] mb-0.5">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1 bg-[#D6BD98]/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#1A3636] to-[#40534C] rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div className="bg-white border-b border-[#D6BD98]/30 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-[#D6BD98]/20 rounded-lg transition-colors group"
                >
                  <ArrowLeft className="w-5 h-5 text-[#40534C] group-hover:text-[#1A3636]" />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-[#1A3636] flex items-center gap-2">
                    <ClipboardList className="w-7 h-7 lg:w-8 lg:h-8 text-[#677D6A]" />
                    Fill In The Forms
                  </h1>
                  <p className="mt-1 text-sm text-[#40534C] flex items-center gap-2">
                    <span>Complete all {steps.length} steps to submit your report</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  form="report-form"
                  name="action"
                  value="draft"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 border-2 border-[#677D6A] text-[#40534C] rounded-xl hover:bg-[#D6BD98]/10 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm lg:text-base"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </button>
                <button
                  type="submit"
                  form="report-form"
                  name="action"
                  value="submit"
                  disabled={isSubmitting || activeStep < 7}
                  className={`px-4 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-lg text-sm lg:text-base ${
                    activeStep === 7
                      ? 'bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white hover:from-[#40534C] hover:to-[#677D6A]'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Report
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Desktop Progress Steps - Icons with numbered labels (not clickable) */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                          activeStep >= step.id
                            ? 'border-[#677D6A] bg-[#677D6A] text-white'
                            : 'border-[#D6BD98] bg-white text-[#40534C]'
                        }`}
                      >
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div className="ml-3 text-left">
                        <p className="text-sm font-medium text-[#1A3636]">{step.id}. {step.name}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 ${
                        activeStep > step.id ? 'bg-[#677D6A]' : 'bg-[#D6BD98]'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border border-[#D6BD98]/20 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <div className="p-4 sm:p-6">
                <ReportForm
                  id="report-form"
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  onStepChange={setActiveStep}
                  initialStep={activeStep}
                />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="border border-[#D6BD98]/20 bg-gradient-to-br from-[#1A3636] to-[#40534C] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D6BD98]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="p-4 sm:p-6 relative z-10">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 mb-3 sm:mb-4">
                  <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#D6BD98]" />
                  Quick Tips
                </h3>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  {steps.map(step => (
                    <li key={step.id} className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        activeStep >= step.id ? 'bg-[#D6BD98]' : 'bg-white/30'
                      }`} />
                      <span className={activeStep >= step.id ? 'text-white' : 'text-white/60'}>
                        {step.id}. {step.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateReport