// src/pages/rm/RMChecklistCreator.tsx
import React, { useState, useEffect } from 'react'
import { useCreateRmChecklistMutation, useUpdateRmChecklistMutation } from '@/services/api/checklistsApi'
import { useGetClientByCustomerNumberQuery } from '@/services/api/clientsApi'
import { Checklist, CreateChecklistDto } from '@/types/checklist.types'
import { useAuth } from '@/hooks/useAuth'
import { FiX, FiFileText, FiUser, FiBriefcase, FiHash, FiMail, FiSave, FiPenTool, } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface RMChecklistCreatorProps {
  open: boolean
  checklist: Checklist | null
  onClose: () => void
}

const initialFormState = {
  customerName: '',
  customerNumber: '',
  customerEmail: '',
  projectName: '',
  ibpsNo: '',
}

export const RMChecklistCreator: React.FC<RMChecklistCreatorProps> = ({
  open,
  checklist,
  onClose,
}) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState(initialFormState)
  const [createChecklist] = useCreateRmChecklistMutation()
  const [updateChecklist] = useUpdateRmChecklistMutation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isValidCustomer, setIsValidCustomer] = useState(false)

  // Use the query to fetch client by customer number
  const { data: clientData, isLoading: isSearching, isError, error } = useGetClientByCustomerNumberQuery(searchTerm, {
    skip: searchTerm.length < 3, // Only search when at least 3 characters
  })

  // Log for debugging
useEffect(() => {
  if (searchTerm.length >= 3) {
    console.log('Searching for customer:', searchTerm)
    console.log('Client data:', clientData)
    console.log('Client data structure:', {
      name: clientData?.Name,
      email: clientData?.Email,
      projectName: clientData?.ProjectName
    })
    console.log('Is error:', isError)
    console.log('Error:', error)
  }
}, [searchTerm, clientData, isError, error])

  useEffect(() => {
    if (checklist) {
      setFormData({
        customerName: checklist.customerName || '',
        customerNumber: checklist.customerNumber || '',
        customerEmail: checklist.customerEmail || '',
        projectName: checklist.projectName || '',
        ibpsNo: checklist.ibpsNo || '',
      })
      // If editing an existing checklist, mark customer as valid if they have a customer number
      setIsValidCustomer(!!checklist.customerNumber)
    } else {
      setFormData(initialFormState)
      setIsValidCustomer(false)
    }
  }, [checklist])

 // Auto-populate when client data is found
useEffect(() => {
  if (clientData) {
    console.log('Client data received:', clientData)
    setFormData(prev => ({
      ...prev,
      // Handle both PascalCase and camelCase
      customerName: clientData.Name || clientData.name || '',
      customerEmail: clientData.Email || clientData.email || '',
      projectName: clientData.ProjectName || clientData.projectName || prev.projectName,
    }))
    setIsValidCustomer(true)
    toast.success('Customer details found', { duration: 2000 })
  }
}, [clientData])

  // Handle error state
  useEffect(() => {
    if (isError && searchTerm.length >= 3) {
      console.log('Error fetching client:', error)
      setFormData(prev => ({
        ...prev,
        customerName: '',
        customerEmail: '',
      }))
      setIsValidCustomer(false)
      toast.error('Customer not found')
    }
  }, [isError, searchTerm, error])

  const handleCustomerNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, customerNumber: value }))
    
    // Clear customer details immediately if field is empty
    if (value.length === 0) {
      setFormData(prev => ({
        ...prev,
        customerNumber: '',
        customerName: '',
        customerEmail: '',
      }))
      setIsValidCustomer(false)
      setSearchTerm('')
    } 
    // Start searching when we have enough characters
    else if (value.length >= 3) {
      setSearchTerm(value)
    } 
    // Clear customer details if less than 3 characters
    else if (value.length < 3 && value.length > 0) {
      setFormData(prev => ({
        ...prev,
        customerName: '',
        customerEmail: '',
      }))
      setIsValidCustomer(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Only allow editing of specific fields
    const editableFields = ['customerNumber', 'projectName', 'ibpsNo']
    
    if (editableFields.includes(name)) {
      if (name === 'customerNumber') {
        handleCustomerNumberChange(e)
      } else {
        setFormData(prev => ({ ...prev, [name]: value }))
      }
    }
  }

  const validateForm = () => {
    if (!formData.customerNumber.trim()) {
      toast.error('Customer number is required')
      return false
    }
    if (!isValidCustomer) {
      toast.error('Please enter a valid customer number')
      return false
    }
    if (!formData.projectName.trim()) {
      toast.error('Project name is required')
      return false
    }
    if (!formData.ibpsNo.trim()) {
      toast.error('IBPS number is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const payload: CreateChecklistDto = {
        customerName: formData.customerName,
        customerNumber: formData.customerNumber,
        customerEmail: formData.customerEmail,
        projectName: formData.projectName,
        ibpsNo: formData.ibpsNo,
        assignedToRM: user?.id || '',
        documents: [],
      }

      console.log('Submitting payload:', payload)

      if (checklist) {
        await updateChecklist({
          id: checklist._id,
          payload: {
            ...payload,
            status: checklist.status,
          },
        }).unwrap()
        toast.success('Checklist updated successfully')
      } else {
        await createChecklist(payload).unwrap()
        toast.success('Checklist created successfully')
      }
      
      onClose()
    } catch (error) {
      console.error('Failed to save checklist:', error)
      toast.error('Failed to save checklist')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md transform rounded-xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D6BD98]/20 bg-gradient-to-r from-[#1A3636] to-[#40534C] rounded-t-xl">
            <div className="flex items-center gap-2">
              <FiFileText className="w-4 h-4 text-[#D6BD98]" />
              <h2 className="text-sm font-semibold text-white">
                {checklist ? 'Edit Call Report' : 'New Call Report'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5">
            <div className="space-y-3">
              {/* Customer Number - EDITABLE */}
              <div>
                <label className="block text-[10px] font-medium text-[#40534C] mb-1 uppercase tracking-wider">
                  Customer Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiPenTool className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#677D6A]" />
                  <input
                    type="text"
                    name="customerNumber"
                    value={formData.customerNumber}
                    onChange={handleChange}
                    placeholder="Enter customer number"
                    className="w-full pl-9 pr-10 py-2 text-xs border border-[#D6BD98]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#677D6A]/30 focus:border-[#677D6A] bg-white placeholder:text-[#677D6A]/50"
                    required
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-3.5 h-3.5 border-2 border-[#677D6A] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <p className="text-[8px] text-[#677D6A] mt-1">
                  Type at least 3 characters to auto-populate customer details
                </p>
              </div>

              {/* Customer Name - READ ONLY */}
              <div>
                <label className="block text-[10px] font-medium text-[#40534C] mb-1 uppercase tracking-wider">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#677D6A]" />
                  <input
                    type="text"
                    value={formData.customerName}
                    placeholder="Enter customer number first"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#D6BD98]/30 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    readOnly
                    required
                  />
                </div>
              </div>

              {/* Email Address - READ ONLY */}
              <div>
                <label className="block text-[10px] font-medium text-[#40534C] mb-1 uppercase tracking-wider">
                  Email Address <span className="text-[#677D6A] text-[8px]">(Optional)</span>
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#677D6A]" />
                  <input
                    type="email"
                    value={formData.customerEmail}
                    placeholder="Enter customer number first"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#D6BD98]/30 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>

              {/* Project Name - EDITABLE */}
              <div>
                <label className="block text-[10px] font-medium text-[#40534C] mb-1 uppercase tracking-wider">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#677D6A]" />
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    placeholder="Enter project name"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#D6BD98]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#677D6A]/30 focus:border-[#677D6A] bg-white placeholder:text-[#677D6A]/50"
                    required
                  />
                </div>
              </div>

              {/* IBPS Number - EDITABLE */}
              <div>
                <label className="block text-[10px] font-medium text-[#40534C] mb-1 uppercase tracking-wider">
                  IBPS Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#677D6A]" />
                  <input
                    type="text"
                    name="ibpsNo"
                    value={formData.ibpsNo}
                    onChange={handleChange}
                    placeholder="Enter IBPS number"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#D6BD98]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#677D6A]/30 focus:border-[#677D6A] bg-white placeholder:text-[#677D6A]/50"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#D6BD98]/20">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#40534C] bg-[#F5F7F4] border border-[#D6BD98]/30 rounded-lg hover:bg-[#D6BD98]/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isValidCustomer}
                className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-[#1A3636] to-[#40534C] rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-3.5 h-3.5" />
                    <span>{checklist ? 'Update' : 'Create'} Call Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RMChecklistCreator