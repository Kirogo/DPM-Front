import React from 'react'

export interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  bordered?: boolean
  hoverable?: boolean
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  bordered = true,
  hoverable = false,
  onClick,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={`
        bg-white rounded-xl shadow-md
        ${bordered ? 'border border-secondary-200' : ''}
        ${hoverable ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
