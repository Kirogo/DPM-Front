// src/pages/qs/QSSchedulePage.tsx
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { qsApi } from '@/services/api/qsApi'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { FiCalendar, FiMapPin, FiClock, FiUser, FiFileText } from 'react-icons/fi'
import toast from 'react-hot-toast'

export const QSSchedulePage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    reportId: '',
    scheduledDate: '',
    scheduledTime: '',
    siteAddress: '',
    notes: '',
    rmId: '',
    qsId: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (id) {
        await qsApi.updateSiteVisit(id, formData)
        toast.success('Site visit updated successfully')
      } else {
        await qsApi.scheduleSiteVisit(formData)
        toast.success('Site visit scheduled successfully')
      }
      navigate('/qs/site-visits')
    } catch (error) {
      toast.error('Failed to schedule site visit')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7F4]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#F5F7F4] border-b border-[#D6BD98]/20 px-4 py-2 lg:px-6 lg:py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/qs/site-visits')}
            className="text-[#677D6A] hover:text-[#1A3636]"
          >
            ←
          </button>
          <div>
            <h1 className="text-xs lg:text-sm font-semibold text-[#1A3636]">
              {id ? 'Edit Site Visit' : 'Schedule Site Visit'}
            </h1>
            <p className="text-[8px] lg:text-xs text-[#677D6A] mt-0.5">
              {id ? 'Update visit details' : 'Schedule a new site inspection'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 lg:px-6 py-3">
        <Card className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Report Selection */}
            <div>
              <label className="block text-[10px] lg:text-xs font-medium text-[#1A3636] mb-1">
                Related Report
              </label>
              <select
                value={formData.reportId}
                onChange={(e) => setFormData({ ...formData, reportId: e.target.value })}
                className="w-full px-3 py-2 text-[10px] lg:text-xs bg-white border border-[#D6BD98]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A3636]/20"
                required
              >
                <option value="">Select a report</option>
                <option value="1">CRN-2024-001 - ABC Construction</option>
                <option value="2">CRN-2024-002 - XYZ Developers</option>
                <option value="3">CRN-2024-003 - PQR Holdings</option>
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] lg:text-xs font-medium text-[#1A3636] mb-1">
                  Date
                </label>
                <Input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  required
                  className="text-[10px] lg:text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] lg:text-xs font-medium text-[#1A3636] mb-1">
                  Time
                </label>
                <Input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="text-[10px] lg:text-xs"
                />
              </div>
            </div>

            {/* Site Address */}
            <div>
              <label className="block text-[10px] lg:text-xs font-medium text-[#1A3636] mb-1">
                Site Address
              </label>
              <textarea
                value={formData.siteAddress}
                onChange={(e) => setFormData({ ...formData, siteAddress: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-[10px] lg:text-xs bg-white border border-[#D6BD98]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A3636]/20"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] lg:text-xs font-medium text-[#1A3636] mb-1">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-[10px] lg:text-xs bg-white border border-[#D6BD98]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A3636]/20"
                placeholder="Any special instructions or notes for the site visit..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isLoading}
                className="flex-1 text-[10px] lg:text-xs"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" label="Saving..." />
                ) : (
                  id ? 'Update Visit' : 'Schedule Visit'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => navigate('/qs/site-visits')}
                className="flex-1 text-[10px] lg:text-xs"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default QSSchedulePage