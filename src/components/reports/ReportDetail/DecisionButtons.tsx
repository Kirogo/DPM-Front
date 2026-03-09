import React, { useState } from 'react'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { Input } from '@/components/common/Input'

interface DecisionButtonsProps {
  reportId: string
  onDecision: (decision: {
    decision: 'approve' | 'reject' | 'revision' | 'site_visit'
    comment: string
    requiredChanges?: string[]
  }) => void
}

export const DecisionButtons: React.FC<DecisionButtonsProps> = ({
  reportId,
  onDecision,
}) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type: 'approve' | 'reject' | 'revision' | 'site_visit' | null
  }>({
    isOpen: false,
    type: null,
  })

  const [comment, setComment] = useState('')
  const [requiredChanges, setRequiredChanges] = useState<string[]>([])
  const [newChange, setNewChange] = useState('')

  const handleDecision = () => {
    if (!modalState.type) return

    onDecision({
      decision: modalState.type,
      comment,
      ...(modalState.type === 'revision' && { requiredChanges }),
    })

    setModalState({ isOpen: false, type: null })
    setComment('')
    setRequiredChanges([])
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

  const getModalTitle = () => {
    switch (modalState.type) {
      case 'approve':
        return 'Approve Report'
      case 'reject':
        return 'Reject Report'
      case 'revision':
        return 'Request Revision'
      case 'site_visit':
        return 'Schedule Site Visit'
      default:
        return ''
    }
  }

  const getModalDescription = () => {
    switch (modalState.type) {
      case 'approve':
        return 'Are you sure you want to approve this report? This action cannot be undone.'
      case 'reject':
        return 'Please provide a reason for rejecting this report.'
      case 'revision':
        return 'List the changes required for this report.'
      case 'site_visit':
        return 'Add any notes for the scheduled site visit.'
      default:
        return ''
    }
  }

  return (
    <>
      <div className="space-y-3">
        <Button
          variant="success"
          fullWidth
          onClick={() => setModalState({ isOpen: true, type: 'approve' })}
          leftIcon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        >
          Approve Report
        </Button>

        <Button
          variant="outline"
          fullWidth
          onClick={() => setModalState({ isOpen: true, type: 'revision' })}
          leftIcon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
        >
          Request Revision
        </Button>

        <Button
          variant="outline"
          fullWidth
          onClick={() => setModalState({ isOpen: true, type: 'site_visit' })}
          leftIcon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        >
          Schedule Site Visit
        </Button>

        <Button
          variant="danger"
          fullWidth
          onClick={() => setModalState({ isOpen: true, type: 'reject' })}
          leftIcon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
        >
          Reject Report
        </Button>
      </div>

      {/* Decision Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, type: null })}
        title={getModalTitle()}
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary-600">{getModalDescription()}</p>

          {/* Required Changes for Revision */}
          {modalState.type === 'revision' && (
            <div className="space-y-3">
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
                <div className="space-y-2">
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

          {/* Comment for all decisions */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              {modalState.type === 'approve'
                ? 'Approval notes (optional)'
                : modalState.type === 'reject'
                ? 'Rejection reason *'
                : modalState.type === 'revision'
                ? 'Additional comments'
                : 'Site visit notes'}
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your comments here..."
              required={modalState.type === 'reject'}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setModalState({ isOpen: false, type: null })}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDecision}
              disabled={
                (modalState.type === 'reject' && !comment) ||
                (modalState.type === 'revision' && requiredChanges.length === 0 && !comment)
              }
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}