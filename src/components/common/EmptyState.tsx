// src/components/common/EmptyState.tsx
import React from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon
}) => {
  return (
    <div className="text-center py-8 sm:py-12">
      {/* Icon */}
      <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-[#D6BD98]/20 rounded-full flex items-center justify-center mb-4">
        {icon || (
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#677D6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )}
      </div>

      {/* Text */}
      <h3 className="text-base sm:text-lg font-medium text-[#1A3636] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#677D6A] max-w-sm mx-auto mb-6">
        {description}
      </p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="md"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}