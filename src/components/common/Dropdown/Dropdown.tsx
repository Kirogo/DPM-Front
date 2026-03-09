import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

export interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  placement?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  className?: string
  menuClassName?: string
  closeOnClick?: boolean
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  placement = 'bottom-left',
  className = '',
  menuClassName = '',
  closeOnClick = true,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getMenuPosition = () => {
    if (!triggerRef.current) return {}

    const rect = triggerRef.current.getBoundingClientRect()
    const positions: Record<string, any> = {
      'bottom-left': {
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      },
      'bottom-right': {
        top: rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right - window.scrollX,
      },
      'top-left': {
        bottom: window.innerHeight - rect.top - window.scrollY + 4,
        left: rect.left + window.scrollX,
      },
      'top-right': {
        bottom: window.innerHeight - rect.top - window.scrollY + 4,
        right: window.innerWidth - rect.right - window.scrollX,
      },
    }

    return positions[placement]
  }

  const handleTriggerClick = () => {
    setIsOpen(!isOpen)
  }

  const handleMenuItemClick = () => {
    if (closeOnClick) {
      setIsOpen(false)
    }
  }

  const menuStyle = getMenuPosition()

  return (
    <div className={`relative ${className}`} ref={triggerRef}>
      <div onClick={handleTriggerClick}>{trigger}</div>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className={`
              fixed z-50 min-w-[160px] bg-white rounded-lg shadow-lg
              border border-secondary-200 py-1
              animate-in fade-in zoom-in-95
              ${menuClassName}
            `}
            style={menuStyle}
            onClick={handleMenuItemClick}
          >
            {children}
          </div>,
          document.body
        )}
    </div>
  )
}