// src/components/dashboard/NotificationCenter.tsx
import React from 'react'
import { Button } from '@/components/common/Button'
import { formatDistanceToNow } from 'date-fns'
import { 
  FiBell, 
  FiCheck, 
  FiX, 
  FiCheckCircle,
  FiAlertCircle,
  FiInfo
} from 'react-icons/fi'

interface Notification {
  id: string
  title: string
  message: string
  timestamp: Date
  read: boolean
  type?: 'info' | 'success' | 'warning' | 'error'
}

interface NotificationCenterProps {
  notifications: Notification[]
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  isOpen: boolean
  onClose?: () => void
}

const notificationIcons = {
  info: <FiInfo className="w-5 h-5 text-[#677D6A]" />,
  success: <FiCheckCircle className="w-5 h-5 text-[#677D6A]" />,
  warning: <FiAlertCircle className="w-5 h-5 text-[#D6BD98]" />,
  error: <FiAlertCircle className="w-5 h-5 text-[#D6BD98]" />,
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  markAsRead,
  markAllAsRead,
  clearAll,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#F5F7F4] border border-[#D6BD98]/20 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-[#D6BD98]/20 bg-gradient-to-r from-[#1A3636] to-[#40534C]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FiBell className="w-5 h-5 text-white" />
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-[#D6BD98] text-[#1A3636] text-xs font-medium rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close notifications"
          >
            <FiX className="w-4 h-4 text-white" />
          </button>
        </div>
        
        {unreadCount > 0 && (
          <div className="flex justify-end mt-2">
            <button
              onClick={markAllAsRead}
              className="text-xs text-white/80 hover:text-white flex items-center gap-1 transition-colors"
            >
              <FiCheck className="w-3 h-3" />
              Mark all as read
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#D6BD98]/10 flex items-center justify-center">
              <FiBell className="w-8 h-8 text-[#677D6A]" />
            </div>
            <p className="text-sm text-[#40534C]">No notifications</p>
            <p className="text-xs text-[#677D6A] mt-1">
              You're all caught up!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#D6BD98]/20">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-[#D6BD98]/5 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-[#D6BD98]/5' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${
                    !notification.read ? 'bg-[#677D6A]/10' : 'bg-[#D6BD98]/10'
                  } flex items-center justify-center`}>
                    {notification.type ? notificationIcons[notification.type] : <FiInfo className="w-4 h-4 text-[#677D6A]" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className={`text-sm font-medium ${
                        !notification.read ? 'text-[#1A3636]' : 'text-[#40534C]'
                      }`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-[#677D6A] flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-[#677D6A] mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-[#677D6A]/70 mt-2">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-[#D6BD98]/20 bg-[#F5F7F4]">
          <div className="flex justify-between items-center">
            <button
              onClick={clearAll}
              className="text-xs text-[#677D6A] hover:text-[#40534C] transition-colors"
            >
              Clear all
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {}}
              className="text-xs border-[#677D6A] text-[#40534C] hover:bg-[#677D6A] hover:text-white"
            >
              View all activity
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}