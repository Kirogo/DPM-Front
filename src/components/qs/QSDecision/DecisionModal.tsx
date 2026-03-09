import React, { useState } from 'react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { DecisionType } from '@/types/report.types'

interface DecisionModalProps {
  isOpen: boolean
  onClose: () => void
  onDecision: (decision: {
    type: DecisionType
    comment: string
    requiredChanges?: string[]
    scheduledDate?: Date
  }) => void
  reportTitle: string
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  isOpen,
  onClose,
  onDecision,
  reportTitle,
}) => {
  const [step, setStep] = useState<'initial' | 'details'>('initial')
  const [decisionType, setDecisionType] = useState<DecisionType | null>(null)
  const [comment, setComment] = useState('')
  const [requiredChanges, setRequiredChanges] = useState<string[]>([])
  const [newChange, setNewChange] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')

  const handleTypeSelect = (type: DecisionType) => {
    setDecisionType(type)
    setStep('details')
  }

  const handleBack = () => {
    setStep('initial')
    setDecisionType(null)
    setComment('')
    setRequiredChanges([])
    setNewChange('')
    setScheduledDate('')
  }

  const handleSubmit = () => {
    if (!decisionType) return

    onDecision({
      type: decisionType,
      comment,
      ...(decisionType === 'revision' && { requiredChanges }),
      ...(decisionType === 'site_visit' && { scheduledDate: new Date(scheduledDate) }),
    })

    handleBack()
    onClose()
  }

  const handleAddChange = () => {
    if (newChange.trim()) {
      setRequiredChanges([...requiredChanges, newChange.trim()])
      setNewChange('')
    }
  }

  const handleRemoveChange = (index: number) => {
    setRequiredChanges(requiredChanges.filter((_, i) => i !== index))
  }

  const getTitle = () => {
    if (step === 'initial') return 'Make Decision'
    switch (decisionType) {
      case 'approve':
        return 'Approve Report'
      case 'reject':
        return 'Reject Report'
      case 'revision':
        return 'Request Revision'
      case 'site_visit':
        return 'Schedule Site Visit'
      default:
        return 'Make Decision'
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleBack()
        onClose()
      }}
      title={getTitle()}
      size="lg"
    >
      <div className="space-y-6">
        {step === 'initial' ? (
          <>
            <p className="text-sm text-secondary-600">
              How would you like to proceed with "{reportTitle}"?
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleTypeSelect('approve')}
                className="p-4 border-2 border-success/20 rounded-lg hover:border-success hover:bg-success/5 transition-colors"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
                    <svg className="h-6 w-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-secondary-900">Approve</h3>
                  <p className="mt-1 text-xs text-secondary-500">
                    Report meets all requirements
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect('revision')}
                className="p-4 border-2 border-warning/20 rounded-lg hover:border-warning hover:bg-warning/5 transition-colors"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center mb-3">
                    <svg className="h-6 w-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-secondary-900">Request Revision</h3>
                  <p className="mt-1 text-xs text-secondary-500">
                    Changes needed before approval
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect('site_visit')}
                className="p-4 border-2 border-info/20 rounded-lg hover:border-info hover:bg-info/5 transition-colors"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center mb-3">
                    <svg className="h-6 w-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-secondary-900">Schedule Site Visit</h3>
                  <p className="mt-1 text-xs text-secondary-500">
                    Need to inspect the site personally
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect('reject')}
                className="p-4 border-2 border-error/20 rounded-lg hover:border-error hover:bg-error/5 transition-colors"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center mb-3">
                    <svg className="h-6 w-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-secondary-900">Reject</h3>
                  <p className="mt-1 text-xs text-secondary-500">
                    Report does not meet requirements
                  </p>
                </div>
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* Decision-specific forms */}
            {decisionType === 'revision' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-secondary-700">
                  Required Changes
                </label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add required change..."
                    value={newChange}
                    onChange={(e) => setNewChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddChange()}
                  />
                  <Button onClick={handleAddChange}>Add</Button>
                </div>

                {requiredChanges.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {requiredChanges.map((change, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-secondary-50 rounded"
                      >
                        <span className="text-sm">{change}</span>
                        <button
                          onClick={() => handleRemoveChange(index)}
                          className="text-error hover:text-error/80"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {decisionType === 'site_visit' && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Scheduled Date
                </label>
                <Input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}

            {/* Comment for all decisions */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                {decisionType === 'approve'
                  ? 'Approval Notes (optional)'
                  : decisionType === 'reject'
                  ? 'Rejection Reason *'
                  : decisionType === 'revision'
                  ? 'Additional Comments'
                  : 'Site Visit Notes'}
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your comments here..."
                required={decisionType === 'reject'}
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <div className="space-x-3">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={
                    (decisionType === 'reject' && !comment) ||
                    (decisionType === 'revision' && requiredChanges.length === 0 && !comment) ||
                    (decisionType === 'site_visit' && !scheduledDate)
                  }
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}