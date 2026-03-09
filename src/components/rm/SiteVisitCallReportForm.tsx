// src/components/rm/SiteVisitCallReportForm.tsx
import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  SiteVisitCallReportForm,
  SiteVisitSubmittedDocs,
} from '../../types/checklist.types'
import { useUploadRmChecklistPhotoMutation, useUploadRmChecklistDocumentMutation } from '@/services/api/checklistsApi'
import { FileText, Upload, X, File } from 'lucide-react'

type Props = {
  value: SiteVisitCallReportForm
  onChange: (value: SiteVisitCallReportForm) => void
  activeStep?: number
  isReadOnly?: boolean // Add this
}

// REDUCED PADDING: Changed from p-4 md:p-5 to p-3 md:p-4
const pageCardClass =
  'rounded-lg border border-gray-200 bg-white p-3 md:p-4 space-y-3' 

const labelClass = 'block text-xs font-medium text-gray-700 mb-1'
const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]'
const textareaClass = `${inputClass} min-h-[80px]`

const updatePhotoList = (list: string[], index: number, next: string): string[] => {
  const copy = [...list]
  copy[index] = next
  return copy
}

// DocumentItem component
const DocumentItem: React.FC<{
  label: string
  documentKey: keyof Pick<SiteVisitSubmittedDocs, 
    'qsValuation' | 'interimCertificate' | 'customerInstructionLetter' | 
    'contractorProgressReport' | 'contractorInvoice'
  >
  value: SiteVisitSubmittedDocs
  onSelectionChange: (field: keyof SiteVisitSubmittedDocs, value: string) => void
  onFileChange: (field: keyof SiteVisitSubmittedDocs, fileUrl: string) => void
  onReasonChange: (field: keyof SiteVisitSubmittedDocs, reason: string) => void
  isReadOnly?: boolean
}> = ({ label, documentKey, value, onSelectionChange, onFileChange, onReasonChange, isReadOnly = false }) => {
  const [uploadDocument, { isLoading: isUploading }] = useUploadRmChecklistDocumentMutation()
  const [uploading, setUploading] = React.useState(false)
  
  const selection = value[documentKey] as string || ''
  const fileUrl = value[`${documentKey}File` as keyof SiteVisitSubmittedDocs] as string || ''
  const reason = value[`${documentKey}Reason` as keyof SiteVisitSubmittedDocs] as string || ''

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)
      const uploaded = await uploadDocument({
        file,
        documentType: documentKey,
      }).unwrap()

      onFileChange(documentKey, uploaded.url)
      toast.success(`${label} uploaded successfully`)
    } catch (error: any) {
      toast.error(error?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = () => {
    onFileChange(documentKey, '')
  }

  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-3">
      {/* Document Title - Bolder and left aligned */}
      <h5 className="text-sm text-gray-900">{label}</h5>
      
      <div className="flex flex-col md:flex-row md:items-start gap-3">
        {/* Selection Dropdown - Full width on mobile, 1/3 on desktop */}
        <div className="w-full md:w-1/3">
          <select 
            className={`${inputClass} ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            value={selection} 
            onChange={(e) => onSelectionChange(documentKey, e.target.value)}
            disabled={isReadOnly}
          >
            <option value="">Select</option>
            <option value="Yes">Yes - Attached</option>
            <option value="No">No - Not Submitted</option>
          </select>
        </div>

        {/* Conditional UI based on selection - Full width on mobile */}
        <div className="flex-1 w-full">
          {selection === 'Yes' && (
            <div className="space-y-2">
              {fileUrl ? (
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <File className="w-4 h-4 text-[#40534C] flex-shrink-0" />
                    <a 
                      href={fileUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline truncate"
                    >
                      {fileUrl.split('/').pop() || 'View Document'}
                    </a>
                  </div>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : !isReadOnly ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    className="block w-full text-xs text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-[#D6BD98]/20 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#40534C] hover:file:bg-[#D6BD98]/30"
                    onChange={(event) => {
                      const selected = event.target.files?.[0]
                      if (selected) {
                        handleFileUpload(selected)
                      }
                    }}
                    disabled={isUploading || uploading}
                  />
                  {(isUploading || uploading) && (
                    <span className="text-xs text-[#D4AF37] whitespace-nowrap">Uploading...</span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No file uploaded</p>
              )}
            </div>
          )}

          {selection === 'No' && (
            isReadOnly ? (
              <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded-md">
                {reason || 'No reason provided'}
              </p>
            ) : (
              <textarea
                className={textareaClass}
                placeholder="Please provide reason for not submitting this document..."
                value={reason}
                onChange={(e) => onReasonChange(documentKey, e.target.value)}
                rows={2}
                disabled={isReadOnly}
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}

const PhotoGrid: React.FC<{
  title: string
  sectionKey: string
  values: string[]
  onChange: (next: string[]) => void
  isReadOnly?: boolean
}> = ({ title, sectionKey, values, onChange, isReadOnly = false }) => {
  const [uploadChecklistPhoto, { isLoading: isUploading }] = useUploadRmChecklistPhotoMutation()
  const [uploadingIndex, setUploadingIndex] = React.useState<number | null>(null)

  const handleFileUpload = async (file: File, index: number) => {
    try {
      setUploadingIndex(index)
      const uploaded = await uploadChecklistPhoto({
        file,
        section: sectionKey,
        slot: index + 1,
      }).unwrap()

      onChange(updatePhotoList(values, index, uploaded.url))
      toast.success(`Photo ${index + 1} uploaded`)
    } catch (error: any) {
      toast.error(error?.message || 'Photo upload failed')
    } finally {
      setUploadingIndex(null)
    }
  }

  return (
    <section className={pageCardClass}>
      <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {values.map((photoUrl, index) => (
          // REDUCED PADDING: Changed from p-3 to p-2
          <div key={`${title}-${index}`} className={`rounded-md border border-gray-200 p-2 space-y-2 ${isReadOnly ? 'bg-gray-50' : ''}`}>
            <label className={labelClass}>Photo {index + 1}</label>

            {photoUrl ? (
              <div className="space-y-2">
                <img
                  src={photoUrl}
                  alt={`${title} ${index + 1}`}
                  className="w-full h-32 object-cover rounded-md border border-gray-200" // REDUCED HEIGHT: from h-36 to h-32
                />
                <a
                  href={photoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline block truncate"
                >
                  View full image
                </a>
                {!isReadOnly && photoUrl && (
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:underline"
                    onClick={() => onChange(updatePhotoList(values, index, ''))}
                  >
                    Remove photo
                  </button>
                )}
              </div>
            ) : (
              <div className="h-32 rounded-md border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500">
                {isReadOnly ? 'No photo' : 'No photo uploaded'}
              </div>
            )}

            {!isReadOnly && !photoUrl && (
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="block w-full text-xs text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-secondary-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-secondary-700"
                onChange={(event) => {
                  const selected = event.target.files?.[0]
                  if (selected) {
                    void handleFileUpload(selected, index)
                  }
                }}
                disabled={isUploading}
              />
            )}

            {uploadingIndex === index && (
              <p className="text-xs text-[#D4AF37]">Uploading...</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// Step 1: Customer Info Component
const CustomerInfoSection: React.FC<{
  value: SiteVisitCallReportForm;
  onChange: (field: keyof SiteVisitCallReportForm, value: any) => void;
  isReadOnly?: boolean;
}> = ({ value, onChange, isReadOnly = false }) => {
  return (
    <div className="space-y-3"> {/* REDUCED: from space-y-4 to space-y-3 */}
      <section className={pageCardClass}>
        <h4 className="text-sm font-semibold text-gray-900">Customer Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Call Report No.</label>
            <input 
              className={`${inputClass} bg-gray-50`}
              value={value.callReportNo} 
              onChange={(e) => onChange('callReportNo', e.target.value)} 
              readOnly
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className={labelClass}>Customer Name</label>
            <input 
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
              value={value.customerName} 
              onChange={(e) => onChange('customerName', e.target.value)} 
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className={labelClass}>Salaried / Consultancy / Business</label>
            <select 
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              value={value.customerType} 
              onChange={(e) => onChange('customerType', e.target.value)}
              disabled={isReadOnly}
            >
              <option value="">Select type</option>
              <option value="Salaried">Salaried</option>
              <option value="Consultancy">Consultancy</option>
              <option value="Business">Business</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Brief Profile</label>
            <input 
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
              value={value.briefProfile} 
              onChange={(e) => onChange('briefProfile', e.target.value)} 
              placeholder="Brief customer profile"
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

// Step 2: Site Visit Details Component
const SiteVisitSection: React.FC<{
  value: SiteVisitCallReportForm;
  onChange: (field: keyof SiteVisitCallReportForm, value: any) => void;
  isReadOnly?: boolean;
}> = ({ value, onChange, isReadOnly = false }) => {
  // Auto-calculate subtotals when amounts change
  useEffect(() => {
    if (!isReadOnly) {
      const d1 = parseFloat(value.drawnFundsD1) || 0
      const d2 = parseFloat(value.drawnFundsD2) || 0
      const subtotal = d1 + d2
      if (value.drawnFundsSubtotal !== subtotal.toString()) {
        onChange('drawnFundsSubtotal', subtotal.toString())
      }
      
      const loanAmount = parseFloat(value.constructionLoanAmount) || 0
      const undrawn = loanAmount - subtotal
      if (value.undrawnFundsToDate !== undrawn.toString()) {
        onChange('undrawnFundsToDate', undrawn.toString())
      }
    }
  }, [value.drawnFundsD1, value.drawnFundsD2, value.constructionLoanAmount, isReadOnly])

  return (
    <div className="space-y-3"> {/* REDUCED: from space-y-4 to space-y-3 */}
      {/* Visit Details */}
      <section className={pageCardClass}>
        <h4 className="text-sm font-semibold text-gray-900">Visit Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Date and Time of Site Visit</label>
            <input
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
              type="datetime-local"
              value={value.siteVisitDateTime}
              onChange={(e) => onChange('siteVisitDateTime', e.target.value)}
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className={labelClass}>Person Met at Site</label>
            <input
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
              value={value.personMetAtSite}
              onChange={(e) => onChange('personMetAtSite', e.target.value)}
              placeholder="Designation / Name"
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
        </div>
      </section>

      {/* Amounts Breakdown */}
      <section className={pageCardClass}>
        <h4 className="text-sm font-semibold text-gray-900">Amounts Breakdown</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>BQ Amount (KES)</label>
            <input
              type="number"
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
              value={value.bqAmount}
              onChange={(e) => onChange('bqAmount', e.target.value)}
              placeholder="0.00"
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className={labelClass}>Construction Loan Amount (KES)</label>
            <input
              type="number"
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
              value={value.constructionLoanAmount}
              onChange={(e) => onChange('constructionLoanAmount', e.target.value)}
              placeholder="0.00"
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className={labelClass}>Customer's Contribution (KES)</label>
            <input
              type="number"
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
              value={value.customerContribution}
              onChange={(e) => onChange('customerContribution', e.target.value)}
              placeholder="0.00"
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
        </div>
      </section>

      {/* Drawdown Funds */}
      <section className={pageCardClass}>
        <h4 className="text-sm font-semibold text-gray-900">DrawDown Funds to Date</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Drawn Funds D1 (KES)</label>
            <input
              type="number"
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
              value={value.drawnFundsD1}
              onChange={(e) => onChange('drawnFundsD1', e.target.value)}
              placeholder="0.00"
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className={labelClass}>Drawn Funds D2 (KES)</label>
            <input
              type="number"
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
              value={value.drawnFundsD2}
              onChange={(e) => onChange('drawnFundsD2', e.target.value)}
              placeholder="0.00"
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className={labelClass}>Subtotal Drawn Funds (KES)</label>
            <input
              type="number"
              className={`${inputClass} bg-gray-50`}
              value={value.drawnFundsSubtotal}
              readOnly
              placeholder="0.00"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className={labelClass}>Undrawn Funds to Date (KES)</label>
            <input
              type="number"
              className={`${inputClass} bg-gray-50`}
              value={value.undrawnFundsToDate}
              readOnly
              placeholder="0.00"
              disabled={isReadOnly}
            />
          </div>
        </div>
      </section>

      {/* Site Details */}
      <section className={pageCardClass}>
        <h4 className="text-sm font-semibold text-gray-900">Details of the Site</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Exact Location</label>
            <input
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
              value={value.siteExactLocation}
              onChange={(e) => onChange('siteExactLocation', e.target.value)}
              placeholder="Location"
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className={labelClass}>House Located Along</label>
            <input
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
              value={value.houseLocatedAlong}
              onChange={(e) => onChange('houseLocatedAlong', e.target.value)}
              placeholder="Street/Road"
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className={labelClass}>Site Pin</label>
            <input
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
              value={value.sitePin}
              onChange={(e) => onChange('sitePin', e.target.value)}
              placeholder="PIN"
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className={labelClass}>Security Details</label>
            <input
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
              value={value.securityDetails}
              onChange={(e) => onChange('securityDetails', e.target.value)}
              placeholder="Apt no, House No./LR. No."
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className={labelClass}>Plot / LR No.</label>
            <input
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
              value={value.plotLrNo}
              onChange={(e) => onChange('plotLrNo', e.target.value)}
              placeholder="Plot/LR Number"
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

// Step 3: Project Information Component
const ProjectInfoSection: React.FC<{
  value: SiteVisitCallReportForm;
  onChange: (field: keyof SiteVisitCallReportForm, value: any) => void;
  isReadOnly?: boolean;
}> = ({ value, onChange, isReadOnly = false }) => {
  return (
    <div className="space-y-3"> {/* REDUCED: from space-y-4 to space-y-3 */}
      {/* Site Visit Objectives */}
      <section className={pageCardClass}>
        <h4 className="text-sm font-semibold text-gray-900">Site Visit Objectives</h4>
        <div>
          <label className={labelClass}>1: Confirm progress on site and level of work done</label>
          <textarea
            className={`${textareaClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
            value={value.siteVisitObjective1}
            onChange={(e) => onChange('siteVisitObjective1', e.target.value)}
            disabled={isReadOnly}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className={labelClass}>2: Confirm status of the building including taking note of any visible defects</label>
          <textarea
            className={`${textareaClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
            value={value.siteVisitObjective2}
            onChange={(e) => onChange('siteVisitObjective2', e.target.value)}
            disabled={isReadOnly}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className={labelClass}>3: Take note of materials stored on site</label>
          <textarea
            className={`${textareaClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
            value={value.siteVisitObjective3}
            onChange={(e) => onChange('siteVisitObjective3', e.target.value)}
            disabled={isReadOnly}
            readOnly={isReadOnly}
          />
        </div>
      </section>

      {/* Call Details */}
      <section className={pageCardClass}>
        <h4 className="text-sm font-semibold text-gray-900">Call Details</h4>
        <div>
          <label className={labelClass}>Works Complete</label>
          <textarea
            className={`${textareaClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
            value={value.worksComplete}
            onChange={(e) => onChange('worksComplete', e.target.value)}
            placeholder="Construction is currently on going. The following works are complete:"
            disabled={isReadOnly}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className={labelClass}>Works Ongoing</label>
          <textarea
            className={`${textareaClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
            value={value.worksOngoing}
            onChange={(e) => onChange('worksOngoing', e.target.value)}
            placeholder="The following works are ongoing:"
            disabled={isReadOnly}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className={labelClass}>Materials Found on Site</label>
          <textarea
            className={`${textareaClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
            value={value.materialsFoundOnSite}
            onChange={(e) => onChange('materialsFoundOnSite', e.target.value)}
            placeholder="The following materials were found on site:"
            disabled={isReadOnly}
            readOnly={isReadOnly}
          />
        </div>
        <div>
          <label className={labelClass}>Defects Noted</label>
          <textarea
            className={`${textareaClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
            value={value.defectsNotedOnSite}
            onChange={(e) => onChange('defectsNotedOnSite', e.target.value)}
            placeholder="The following defects (design deficiencies, warped beams and slab, visible cracks, plumbing issues etc.) were noted on site:"
            rows={4}
            disabled={isReadOnly}
            readOnly={isReadOnly}
          />
        </div>
      </section>

      {/* Conclusion */}
      <section className={pageCardClass}>
        <h4 className="text-sm font-semibold text-gray-900">Conclusion</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Drawdown Request No.</label>
            <input
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
              value={value.drawdownRequestNo}
              onChange={(e) => onChange('drawdownRequestNo', e.target.value)}
              placeholder="Request number"
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className={labelClass}>Drawdown Amount Requested (KES)</label>
            <input
              type="number"
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
              value={value.drawdownKesAmount}
              onChange={(e) => onChange('drawdownKesAmount', e.target.value)}
              placeholder="0.00"
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

// Step 4: Documents Component
const DocumentsSection: React.FC<{
  value: SiteVisitCallReportForm;
  onChange: (field: keyof SiteVisitCallReportForm, value: any) => void;
  onNestedChange: (field: keyof SiteVisitSubmittedDocs, value: string) => void;
  isReadOnly?: boolean;
}> = ({ value, onChange, onNestedChange, isReadOnly = false }) => {
  
  // Helper functions for document updates
  const handleDocumentSelection = (field: keyof SiteVisitSubmittedDocs, selection: string) => {
    onNestedChange(field, selection)
  }

  const handleDocumentFile = (field: keyof SiteVisitSubmittedDocs, fileUrl: string) => {
    const fileField = `${field}File` as keyof SiteVisitSubmittedDocs
    onChange('documentsSubmitted', {
      ...value.documentsSubmitted,
      [fileField]: fileUrl,
    })
  }

  const handleDocumentReason = (field: keyof SiteVisitSubmittedDocs, reason: string) => {
    const reasonField = `${field}Reason` as keyof SiteVisitSubmittedDocs
    onChange('documentsSubmitted', {
      ...value.documentsSubmitted,
      [reasonField]: reason,
    })
  }

  return (
    <div className="space-y-3">
      <section className={pageCardClass}>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Submitted Documents</h4>
        <div className="space-y-3">
          <DocumentItem
            label="QS Valuation of works done"
            documentKey="qsValuation"
            value={value.documentsSubmitted}
            onSelectionChange={handleDocumentSelection}
            onFileChange={handleDocumentFile}
            onReasonChange={handleDocumentReason}
            isReadOnly={isReadOnly}
          />
          
          <DocumentItem
            label="Interim Certificate"
            documentKey="interimCertificate"
            value={value.documentsSubmitted}
            onSelectionChange={handleDocumentSelection}
            onFileChange={handleDocumentFile}
            onReasonChange={handleDocumentReason}
            isReadOnly={isReadOnly}
          />
          
          <DocumentItem
            label="Customer Instructions Letter"
            documentKey="customerInstructionLetter"
            value={value.documentsSubmitted}
            onSelectionChange={handleDocumentSelection}
            onFileChange={handleDocumentFile}
            onReasonChange={handleDocumentReason}
            isReadOnly={isReadOnly}
          />
          
          <DocumentItem
            label="Contractor's Site Progress Report"
            documentKey="contractorProgressReport"
            value={value.documentsSubmitted}
            onSelectionChange={handleDocumentSelection}
            onFileChange={handleDocumentFile}
            onReasonChange={handleDocumentReason}
            isReadOnly={isReadOnly}
          />
          
          <DocumentItem
            label="Contractor's Invoice (where applicable)"
            documentKey="contractorInvoice"
            value={value.documentsSubmitted}
            onSelectionChange={handleDocumentSelection}
            onFileChange={handleDocumentFile}
            onReasonChange={handleDocumentReason}
            isReadOnly={isReadOnly}
          />
        </div>
      </section>

      <section className={pageCardClass}>
        <h4 className="text-sm font-semibold text-gray-900">Document Sign-off</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Prepared By</label>
            <input
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
              value={value.preparedBy}
              onChange={(e) => onChange('preparedBy', e.target.value)}
              placeholder="Name"
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className={labelClass}>Signature</label>
            <input
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
              value={value.signature}
              onChange={(e) => onChange('signature', e.target.value)}
              placeholder="Signature"
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className={labelClass}>Date</label>
            <input
              className={`${inputClass} ${isReadOnly ? 'bg-gray-50' : ''}`}
              type="date"
              value={value.preparedDate}
              onChange={(e) => onChange('preparedDate', e.target.value)}
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

// Step 5: Photos Component
const PhotosSection: React.FC<{
  value: SiteVisitCallReportForm;
  onChange: (field: keyof SiteVisitCallReportForm, value: any) => void;
  isReadOnly?: boolean;
}> = ({ value, onChange, isReadOnly = false }) => {
  return (
    <div className="space-y-3"> {/* REDUCED: from space-y-4 to space-y-3 */}
      <PhotoGrid
        title="Progress Photos"
        sectionKey="progress-page-3"
        values={value.progressPhotosPage3}
        onChange={(next) => onChange('progressPhotosPage3', next)}
        isReadOnly={isReadOnly}
      />

      <PhotoGrid
        title="Materials on Site"
        sectionKey="materials-on-site"
        values={value.materialsOnSitePhotos}
        onChange={(next) => onChange('materialsOnSitePhotos', next)}
        isReadOnly={isReadOnly}
      />

      <PhotoGrid
        title="Defects Noted"
        sectionKey="defects-noted"
        values={value.defectsNotedPhotos}
        onChange={(next) => onChange('defectsNotedPhotos', next)}
        isReadOnly={isReadOnly}
      />
    </div>
  )
}

// Main Form Component
const SiteVisitCallReportFormComponent: React.FC<Props> = ({ value, onChange, activeStep = 1, isReadOnly = false }) => {
  const updateField = <K extends keyof SiteVisitCallReportForm>(field: K, nextValue: SiteVisitCallReportForm[K]) => {
    if (!isReadOnly) {
      onChange({ ...value, [field]: nextValue })
    }
  }

  const updateSubmittedDocs = (field: keyof SiteVisitSubmittedDocs, nextValue: string) => {
    if (!isReadOnly) {
      onChange({
        ...value,
        documentsSubmitted: {
          ...value.documentsSubmitted,
          [field]: nextValue,
        },
      })
    }
  }

  // Render only the active step
  switch (activeStep) {
    case 1:
      return <CustomerInfoSection value={value} onChange={updateField} isReadOnly={isReadOnly} />
    case 2:
      return <SiteVisitSection value={value} onChange={updateField} isReadOnly={isReadOnly} />
    case 3:
      return <ProjectInfoSection value={value} onChange={updateField} isReadOnly={isReadOnly} />
    case 4:
      return <DocumentsSection value={value} onChange={updateField} onNestedChange={updateSubmittedDocs} isReadOnly={isReadOnly} />
    case 5:
      return <PhotosSection value={value} onChange={updateField} isReadOnly={isReadOnly} />
    default:
      return <CustomerInfoSection value={value} onChange={updateField} isReadOnly={isReadOnly} />
  }
}

export default SiteVisitCallReportFormComponent