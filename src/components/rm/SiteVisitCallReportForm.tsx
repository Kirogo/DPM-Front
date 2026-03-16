// src/components/rm/SiteVisitCallReportForm.tsx
import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  SiteVisitCallReportForm,
  SiteVisitSubmittedDocs,
  DrawdownItem,
} from '../../types/checklist.types'
import { useUploadRmChecklistDocumentMutation, useUploadRmChecklistPhotoMutation } from '@/services/api/checklistsApi'
import { Upload, X, Plus, Trash2 } from 'lucide-react'

type Props = {
  value: SiteVisitCallReportForm
  onChange: (value: SiteVisitCallReportForm) => void
  activeStep?: number
  isReadOnly?: boolean
}

// Helper function to migrate old data format to new format
const migrateDrawdowns = (formData: SiteVisitCallReportForm): SiteVisitCallReportForm => {
  // If drawdowns array doesn't exist or is empty, check if we have old data
  if (!formData.drawdowns || formData.drawdowns.length === 0) {
    // Check if we have old drawdown data
    const hasOldD1 = (formData as any).drawnFundsD1 && (formData as any).drawnFundsD1 !== ''
    const hasOldD2 = (formData as any).drawnFundsD2 && (formData as any).drawnFundsD2 !== ''
    
    if (hasOldD1 || hasOldD2) {
      // Migrate old data to new format
      const drawdowns: DrawdownItem[] = []
      
      if (hasOldD1) {
        drawdowns.push({
          id: crypto.randomUUID?.() || `d1-${Date.now()}`,
          amount: (formData as any).drawnFundsD1 || ''
        })
      }
      
      if (hasOldD2) {
        drawdowns.push({
          id: crypto.randomUUID?.() || `d2-${Date.now()}`,
          amount: (formData as any).drawnFundsD2 || ''
        })
      }
      
      // Remove old fields and add new array
      const { drawnFundsD1, drawnFundsD2, ...rest } = formData as any
      return {
        ...rest,
        drawdowns
      }
    }
    
    // If no data at all, initialize with one empty drawdown
    return {
      ...formData,
      drawdowns: [{ id: crypto.randomUUID?.() || Date.now().toString(), amount: '' }]
    }
  }
  
  return formData
}

// Helper function to format filename
const formatFileName = (fileName: string): string => {
  if (!fileName) return ''
  
  const parts = fileName.split('-')
  
  if (parts.length >= 4) {
    const originalNameParts = parts.slice(3)
    const originalName = originalNameParts.join('-')
    
    if (originalName) {
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
      
      if (nameWithoutExt.length > 20) {
        return nameWithoutExt.substring(0, 18) + '…'
      }
      return nameWithoutExt
    }
  }
  
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
  if (nameWithoutExt.length > 20) {
    return nameWithoutExt.substring(0, 18) + '…'
  }
  return nameWithoutExt
}

// Helper to get file extension
const getFileExtension = (fileName: string): string => {
  const match = fileName.match(/\.[^/.]+$/)
  return match ? match[0].toLowerCase() : ''
}

// Get file icon
const getFileIcon = (fileName: string) => {
  const ext = getFileExtension(fileName).toLowerCase()
  if (['.pdf'].includes(ext)) return '📄'
  if (['.doc', '.docx'].includes(ext)) return '📝'
  if (['.xls', '.xlsx'].includes(ext)) return '📊'
  if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) return '🖼️'
  return '📎'
}

// Minimal input classes - with BOLDER headers
const sectionClass = 'space-y-3'
const labelClass = 'block text-[9px] font-bold text-[#1A3636] uppercase tracking-wider mb-1'
const inputClass = 'w-full px-2 py-1.5 text-xs border border-[#D6BD98]/20 rounded focus:outline-none focus:border-[#1A3636] bg-white placeholder:text-[#677D6A]/50'
const textareaClass = `${inputClass} min-h-[60px] resize-none`

// DocumentItem component (unchanged)
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

  const getFileNameFromUrl = (url: string): string => {
    if (!url) return ''
    const parts = url.split('/')
    return parts[parts.length - 1]
  }

  const fileName = fileUrl ? getFileNameFromUrl(fileUrl) : ''
  const displayName = formatFileName(fileName)
  const fileIcon = getFileIcon(fileName)

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)
      const uploaded = await uploadDocument({
        file,
        documentType: documentKey,
      }).unwrap()

      onFileChange(documentKey, uploaded.url)
      toast.success(`${label} uploaded`)
    } catch (error: any) {
      toast.error(error?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="py-2 border-b border-[#D6BD98]/10 last:border-0">
      <div className="text-[10px] font-bold text-[#1A3636] mb-1.5">{label}</div>
      
      <div className="flex flex-col md:flex-row gap-2">
        <div className="w-full md:w-1/3">
          <select 
            className={`${inputClass} text-[9px] ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            value={selection} 
            onChange={(e) => onSelectionChange(documentKey, e.target.value)}
            disabled={isReadOnly}
          >
            <option value="">Select</option>
            <option value="Yes">Yes - Attached</option>
            <option value="No">No - Not Submitted</option>
          </select>
        </div>

        <div className="flex-1">
          {selection === 'Yes' && (
            <div>
              {fileUrl ? (
                <div className="flex items-center justify-between bg-[#F5F7F4] p-1.5 rounded">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="text-xs">{fileIcon}</span>
                    <div className="flex flex-col min-w-0">
                      <a 
                        href={fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[9px] text-blue-600 hover:underline truncate font-medium"
                        title={fileName}
                      >
                        {displayName}
                      </a>
                      <span className="text-[7px] text-[#677D6A]">
                        {getFileExtension(fileName)}
                      </span>
                    </div>
                  </div>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => onFileChange(documentKey, '')}
                      className="text-red-500 hover:text-red-700 p-0.5 rounded hover:bg-red-50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : !isReadOnly ? (
                <label className="relative cursor-pointer inline-block">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    className="sr-only"
                    onChange={(event) => {
                      const selected = event.target.files?.[0]
                      if (selected) {
                        handleFileUpload(selected)
                      }
                    }}
                    disabled={isUploading || uploading}
                  />
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#D6BD98]/10 text-[#40534C] rounded text-[9px] hover:bg-[#D6BD98]/20 transition-colors">
                    <Upload className="w-3 h-3" />
                    Choose file
                  </span>
                </label>
              ) : (
                <p className="text-[9px] text-[#677D6A] italic">No file</p>
              )}
              {(isUploading || uploading) && (
                <span className="text-[8px] text-[#D4AF37] ml-2">Uploading...</span>
              )}
            </div>
          )}

          {selection === 'No' && (
            isReadOnly ? (
              <p className="text-[9px] text-[#677D6A] bg-[#F5F7F4] p-1.5 rounded">
                {reason || 'No reason provided'}
              </p>
            ) : (
              <textarea
                className={`${inputClass} text-[9px]`}
                placeholder="Reason for not submitting..."
                value={reason}
                onChange={(e) => onReasonChange(documentKey, e.target.value)}
                rows={2}
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}

// PhotoGrid component (unchanged)
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

      const newValues = [...values]
      newValues[index] = uploaded.url
      onChange(newValues)
      toast.success(`Photo ${index + 1} uploaded`)
    } catch (error: any) {
      toast.error(error?.message || 'Upload failed')
    } finally {
      setUploadingIndex(null)
    }
  }

  return (
    <div className="py-3 border-b border-[#D6BD98]/10 last:border-0">
      <h4 className="text-[10px] font-bold text-[#1A3636] mb-2">{title}</h4>
      <div className="grid grid-cols-2 gap-2">
        {values.map((photoUrl, index) => (
          <div key={`${title}-${index}`} className="space-y-1">
            <div className="text-[8px] text-[#677D6A]">Photo {index + 1}</div>

            {photoUrl ? (
              <div className="space-y-1">
                <img
                  src={photoUrl}
                  alt={`${title} ${index + 1}`}
                  className="w-full h-20 object-cover rounded border border-[#D6BD98]/20"
                />
                <div className="flex items-center justify-between">
                  <a
                    href={photoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[8px] text-blue-600 hover:underline"
                  >
                    View
                  </a>
                  {!isReadOnly && (
                    <button
                      type="button"
                      className="text-[8px] text-red-600 hover:underline"
                      onClick={() => {
                        const newValues = [...values]
                        newValues[index] = ''
                        onChange(newValues)
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-20 rounded border border-dashed border-[#D6BD98]/30 flex items-center justify-center">
                {!isReadOnly ? (
                  <label className="relative cursor-pointer w-full h-full flex items-center justify-center">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={(event) => {
                        const selected = event.target.files?.[0]
                        if (selected) {
                          handleFileUpload(selected, index)
                        }
                      }}
                      disabled={isUploading}
                    />
                    <span className="text-[8px] text-[#677D6A] flex flex-col items-center">
                      <Upload className="w-3 h-3 mb-0.5" />
                      Upload
                    </span>
                  </label>
                ) : (
                  <span className="text-[8px] text-[#677D6A]">No photo</span>
                )}
              </div>
            )}

            {uploadingIndex === index && (
              <p className="text-[7px] text-[#D4AF37]">Uploading...</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Step 1: Customer Info
const CustomerInfoSection: React.FC<{
  value: SiteVisitCallReportForm;
  onChange: (field: keyof SiteVisitCallReportForm, value: any) => void;
  isReadOnly?: boolean;
}> = ({ value, onChange, isReadOnly = false }) => {
  return (
    <div className={sectionClass}>
      <div className="py-3 border-b border-[#D6BD98]/10">
        <h4 className={labelClass}>Customer Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">Call Report No.</label>
            <input 
              className={`${inputClass} bg-gray-50`}
              value={value.callReportNo} 
              onChange={(e) => onChange('callReportNo', e.target.value)} 
              readOnly
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">Customer Name</label>
            <input 
              className={inputClass}
              value={value.customerName} 
              onChange={(e) => onChange('customerName', e.target.value)} 
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">Customer Type</label>
            <select 
              className={inputClass}
              value={value.customerType} 
              onChange={(e) => onChange('customerType', e.target.value)}
              disabled={isReadOnly}
            >
              <option value="">Select</option>
              <option value="Salaried">Salaried</option>
              <option value="Consultancy">Consultancy</option>
              <option value="Business">Business</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">Brief Profile</label>
            <input 
              className={inputClass}
              value={value.briefProfile} 
              onChange={(e) => onChange('briefProfile', e.target.value)} 
              placeholder="Brief profile"
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 2: Site Visit - UPDATED with safe drawdowns handling
const SiteVisitSection: React.FC<{
  value: SiteVisitCallReportForm;
  onChange: (field: keyof SiteVisitCallReportForm, value: any) => void;
  isReadOnly?: boolean;
}> = ({ value, onChange, isReadOnly = false }) => {
  
  // Ensure drawdowns array exists and has at least one item
  const safeDrawdowns = React.useMemo(() => {
    if (!value.drawdowns || value.drawdowns.length === 0) {
      // Check if we need to migrate old data
      const migrated = migrateDrawdowns(value)
      if (migrated.drawdowns) {
        // Update parent with migrated data
        setTimeout(() => {
          Object.keys(migrated).forEach(key => {
            if (key !== 'drawdowns') {
              onChange(key as any, migrated[key as keyof SiteVisitCallReportForm])
            }
          })
          onChange('drawdowns', migrated.drawdowns)
        }, 0)
        return migrated.drawdowns
      }
      return [{ id: crypto.randomUUID?.() || Date.now().toString(), amount: '' }]
    }
    return value.drawdowns
  }, [value])

  // Calculate totals whenever drawdowns change
  useEffect(() => {
    if (!isReadOnly) {
      const subtotal = safeDrawdowns.reduce((sum, drawdown) => {
        return sum + (parseFloat(drawdown.amount) || 0)
      }, 0)
      
      const loanAmount = parseFloat(value.constructionLoanAmount) || 0
      const undrawn = loanAmount - subtotal
      
      if (value.drawnFundsSubtotal !== subtotal.toString()) {
        onChange('drawnFundsSubtotal', subtotal.toString())
      }
      
      if (value.undrawnFundsToDate !== undrawn.toString()) {
        onChange('undrawnFundsToDate', undrawn.toString())
      }
    }
  }, [safeDrawdowns, value.constructionLoanAmount, isReadOnly])

  const handleDrawdownChange = (id: string, amount: string) => {
    const updatedDrawdowns = safeDrawdowns.map(d => 
      d.id === id ? { ...d, amount } : d
    )
    onChange('drawdowns', updatedDrawdowns)
  }

  const handleAddDrawdown = () => {
    const newDrawdown: DrawdownItem = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      amount: ''
    }
    onChange('drawdowns', [...safeDrawdowns, newDrawdown])
  }

  const handleRemoveDrawdown = (id: string) => {
    if (safeDrawdowns.length <= 1) {
      toast.error('At least one drawdown is required')
      return
    }
    const updatedDrawdowns = safeDrawdowns.filter(d => d.id !== id)
    onChange('drawdowns', updatedDrawdowns)
  }

  return (
    <div className={sectionClass}>
      {/* Visit Details */}
      <div className="py-3 border-b border-[#D6BD98]/10">
        <h4 className={labelClass}>Visit Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">Date & Time</label>
            <input
              className={inputClass}
              type="datetime-local"
              value={value.siteVisitDateTime}
              onChange={(e) => onChange('siteVisitDateTime', e.target.value)}
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">Person Met</label>
            <input
              className={inputClass}
              value={value.personMetAtSite}
              onChange={(e) => onChange('personMetAtSite', e.target.value)}
              placeholder="Name"
              disabled={isReadOnly}
            />
          </div>
        </div>
      </div>

      {/* Amounts Breakdown */}
      <div className="py-3 border-b border-[#D6BD98]/10">
        <h4 className={labelClass}>Amounts</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">BQ Amount (KES)</label>
            <input
              type="number"
              className={inputClass}
              value={value.bqAmount}
              onChange={(e) => onChange('bqAmount', e.target.value)}
              placeholder="0.00"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">Construction Loan</label>
            <input
              type="number"
              className={inputClass}
              value={value.constructionLoanAmount}
              onChange={(e) => onChange('constructionLoanAmount', e.target.value)}
              placeholder="0.00"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">Customer Contribution</label>
            <input
              type="number"
              className={inputClass}
              value={value.customerContribution}
              onChange={(e) => onChange('customerContribution', e.target.value)}
              placeholder="0.00"
              disabled={isReadOnly}
            />
          </div>
        </div>
      </div>

      {/* Drawdown Funds - UPDATED with safe handling */}
      <div className="py-3 border-b border-[#D6BD98]/10">
        <div className="flex items-center justify-between mb-2">
          <h4 className={labelClass}>Drawdown Funds</h4>
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleAddDrawdown}
              className="flex items-center gap-1 px-2 py-1 bg-[#677D6A] text-white rounded text-[9px] hover:bg-[#40534C] transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Drawdown
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {safeDrawdowns.map((drawdown, index) => (
            <div key={drawdown.id} className="flex items-center gap-2">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-[8px] text-[#677D6A] block mb-0.5">
                    Drawdown {index + 1} Amount (KES)
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    value={drawdown.amount}
                    onChange={(e) => handleDrawdownChange(drawdown.id, e.target.value)}
                    placeholder="0.00"
                    disabled={isReadOnly}
                  />
                </div>
                <div className="flex items-end">
                  {!isReadOnly && safeDrawdowns.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDrawdown(drawdown.id)}
                      className="mb-1.5 p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove drawdown"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-3 pt-2 border-t border-[#D6BD98]/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-semibold text-[#1A3636] block mb-0.5">Subtotal Drawn</label>
              <input
                type="number"
                className={`${inputClass} bg-gray-50 font-medium`}
                value={value.drawnFundsSubtotal}
                readOnly
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-[9px] font-semibold text-[#1A3636] block mb-0.5">Undrawn Funds</label>
              <input
                type="number"
                className={`${inputClass} bg-gray-50 font-medium`}
                value={value.undrawnFundsToDate}
                readOnly
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Site Details */}
      <div className="py-3 border-b border-[#D6BD98]/10">
        <h4 className={labelClass}>Site Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">Exact Location</label>
            <input
              className={inputClass}
              value={value.siteExactLocation}
              onChange={(e) => onChange('siteExactLocation', e.target.value)}
              placeholder="Location"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">House Located Along</label>
            <input
              className={inputClass}
              value={value.houseLocatedAlong}
              onChange={(e) => onChange('houseLocatedAlong', e.target.value)}
              placeholder="Street/Road"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">Site Pin</label>
            <input
              className={inputClass}
              value={value.sitePin}
              onChange={(e) => onChange('sitePin', e.target.value)}
              placeholder="PIN"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">Security Details</label>
            <input
              className={inputClass}
              value={value.securityDetails}
              onChange={(e) => onChange('securityDetails', e.target.value)}
              placeholder="Apt no, House No."
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">Plot / LR No.</label>
            <input
              className={inputClass}
              value={value.plotLrNo}
              onChange={(e) => onChange('plotLrNo', e.target.value)}
              placeholder="Plot/LR Number"
              disabled={isReadOnly}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 3: Project Info
const ProjectInfoSection: React.FC<{
  value: SiteVisitCallReportForm;
  onChange: (field: keyof SiteVisitCallReportForm, value: any) => void;
  isReadOnly?: boolean;
}> = ({ value, onChange, isReadOnly = false }) => {
  return (
    <div className={sectionClass}>
      {/* Site Visit Objectives */}
      <div className="py-3 border-b border-[#D6BD98]/10">
        <h4 className={labelClass}>Site Visit Objectives</h4>
        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">1: Confirm progress</label>
            <textarea
              className={textareaClass}
              value={value.siteVisitObjective1}
              onChange={(e) => onChange('siteVisitObjective1', e.target.value)}
              disabled={isReadOnly}
              rows={2}
            />
          </div>
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">2: Check defects</label>
            <textarea
              className={textareaClass}
              value={value.siteVisitObjective2}
              onChange={(e) => onChange('siteVisitObjective2', e.target.value)}
              disabled={isReadOnly}
              rows={2}
            />
          </div>
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">3: Note materials</label>
            <textarea
              className={textareaClass}
              value={value.siteVisitObjective3}
              onChange={(e) => onChange('siteVisitObjective3', e.target.value)}
              disabled={isReadOnly}
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Works Progress */}
      <div className="py-3 border-b border-[#D6BD98]/10">
        <h4 className={labelClass}>Works Progress</h4>
        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">Works Complete</label>
            <textarea
              className={textareaClass}
              value={value.worksComplete}
              onChange={(e) => onChange('worksComplete', e.target.value)}
              placeholder="Works complete:"
              disabled={isReadOnly}
              rows={2}
            />
          </div>
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">Works Ongoing</label>
            <textarea
              className={textareaClass}
              value={value.worksOngoing}
              onChange={(e) => onChange('worksOngoing', e.target.value)}
              placeholder="Works ongoing:"
              disabled={isReadOnly}
              rows={2}
            />
          </div>
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">Materials Found</label>
            <textarea
              className={textareaClass}
              value={value.materialsFoundOnSite}
              onChange={(e) => onChange('materialsFoundOnSite', e.target.value)}
              placeholder="Materials:"
              disabled={isReadOnly}
              rows={2}
            />
          </div>
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">Defects Noted</label>
            <textarea
              className={textareaClass}
              value={value.defectsNotedOnSite}
              onChange={(e) => onChange('defectsNotedOnSite', e.target.value)}
              placeholder="Defects:"
              disabled={isReadOnly}
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Drawdown Request */}
      <div className="py-3">
        <h4 className={labelClass}>Drawdown Request</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">Request No.</label>
            <input
              className={inputClass}
              value={value.drawdownRequestNo}
              onChange={(e) => onChange('drawdownRequestNo', e.target.value)}
              placeholder="Request number"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="text-[10px] text-[#677D6A] block mb-0.5">Amount (KES)</label>
            <input
              type="number"
              className={inputClass}
              value={value.drawdownKesAmount}
              onChange={(e) => onChange('drawdownKesAmount', e.target.value)}
              placeholder="0.00"
              disabled={isReadOnly}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 4: Documents
const DocumentsSection: React.FC<{
  value: SiteVisitCallReportForm;
  onChange: (field: keyof SiteVisitCallReportForm, value: any) => void;
  onNestedChange: (field: keyof SiteVisitSubmittedDocs, value: string) => void;
  isReadOnly?: boolean;
}> = ({ value, onChange, onNestedChange, isReadOnly = false }) => {
  
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
    <div className={sectionClass}>
      <div className="py-3 border-b border-[#D6BD98]/10">
        <h4 className={labelClass}>Submitted Documents</h4>
        <div className="space-y-2">
          <DocumentItem
            label="QS Valuation"
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
            label="Customer Instructions"
            documentKey="customerInstructionLetter"
            value={value.documentsSubmitted}
            onSelectionChange={handleDocumentSelection}
            onFileChange={handleDocumentFile}
            onReasonChange={handleDocumentReason}
            isReadOnly={isReadOnly}
          />
          
          <DocumentItem
            label="Contractor's Progress"
            documentKey="contractorProgressReport"
            value={value.documentsSubmitted}
            onSelectionChange={handleDocumentSelection}
            onFileChange={handleDocumentFile}
            onReasonChange={handleDocumentReason}
            isReadOnly={isReadOnly}
          />
          
          <DocumentItem
            label="Contractor's Invoice"
            documentKey="contractorInvoice"
            value={value.documentsSubmitted}
            onSelectionChange={handleDocumentSelection}
            onFileChange={handleDocumentFile}
            onReasonChange={handleDocumentReason}
            isReadOnly={isReadOnly}
          />
        </div>
      </div>

      <div className="py-3">
        <h4 className={labelClass}>Sign-off</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[8px] text-[#677D6A] block mb-0.5">Prepared By</label>
            <input
              className={inputClass}
              value={value.preparedBy}
              onChange={(e) => onChange('preparedBy', e.target.value)}
              placeholder="Name"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="text-[8px] text-[#677D6A] block mb-0.5">Signature</label>
            <input
              className={inputClass}
              value={value.signature}
              onChange={(e) => onChange('signature', e.target.value)}
              placeholder="Signature"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="text-[8px] text-[#677D6A] block mb-0.5">Date</label>
            <input
              className={inputClass}
              type="date"
              value={value.preparedDate}
              onChange={(e) => onChange('preparedDate', e.target.value)}
              disabled={isReadOnly}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 5: Photos
const PhotosSection: React.FC<{
  value: SiteVisitCallReportForm;
  onChange: (field: keyof SiteVisitCallReportForm, value: any) => void;
  isReadOnly?: boolean;
}> = ({ value, onChange, isReadOnly = false }) => {
  return (
    <div className={sectionClass}>
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
  // Migrate data on component mount if needed
  const migratedValue = React.useMemo(() => {
    return migrateDrawdowns(value)
  }, [value])

  // Update parent if migration changed the value
  useEffect(() => {
    if (JSON.stringify(migratedValue) !== JSON.stringify(value)) {
      onChange(migratedValue)
    }
  }, [migratedValue])

  const updateField = <K extends keyof SiteVisitCallReportForm>(field: K, nextValue: SiteVisitCallReportForm[K]) => {
    if (!isReadOnly) {
      onChange({ ...migratedValue, [field]: nextValue })
    }
  }

  const updateSubmittedDocs = (field: keyof SiteVisitSubmittedDocs, nextValue: string) => {
    if (!isReadOnly) {
      onChange({
        ...migratedValue,
        documentsSubmitted: {
          ...migratedValue.documentsSubmitted,
          [field]: nextValue,
        },
      })
    }
  }

  switch (activeStep) {
    case 1:
      return <CustomerInfoSection value={migratedValue} onChange={updateField} isReadOnly={isReadOnly} />
    case 2:
      return <SiteVisitSection value={migratedValue} onChange={updateField} isReadOnly={isReadOnly} />
    case 3:
      return <ProjectInfoSection value={migratedValue} onChange={updateField} isReadOnly={isReadOnly} />
    case 4:
      return <DocumentsSection value={migratedValue} onChange={updateField} onNestedChange={updateSubmittedDocs} isReadOnly={isReadOnly} />
    case 5:
      return <PhotosSection value={migratedValue} onChange={updateField} isReadOnly={isReadOnly} />
    default:
      return <CustomerInfoSection value={migratedValue} onChange={updateField} isReadOnly={isReadOnly} />
  }
}

export default SiteVisitCallReportFormComponent