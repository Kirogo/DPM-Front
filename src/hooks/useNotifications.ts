import { useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAll,
  toggleNotifications,
  setNotificationsOpen,
} from '@/store/slices/notificationSlice'
import notificationHub from '@/services/signalR/notificationHub'
import toast from 'react-hot-toast'

export const useNotifications = () => {
  const dispatch = useAppDispatch()
  const { items, unreadCount, isOpen } = useAppSelector((state) => state.notifications)

  // Connect to SignalR hub when authenticated
  useEffect(() => {
    notificationHub.startConnection()

    return () => {
      notificationHub.stopConnection()
    }
  }, [])

  // Show toast for new notifications
  useEffect(() => {
    const handleNewNotification = (notification: any) => {
      dispatch(addNotification(notification))

      // Show toast based on notification type
      switch (notification.type) {
        case 'success':
          toast.success(notification.message, {
            duration: 5000,
            icon: '✅',
          })
          break
        case 'warning':
          toast.success(notification.message, {
            duration: 7000,
            icon: '⚠️',
          })
          break
        case 'error':
          toast.error(notification.message, {
            duration: 10000,
          })
          break
        default:
          toast.success(notification.message, {
            icon: 'ℹ️',
          })
      }
    }

    // Subscribe to notifications (you'll need to implement this in your SignalR service)
    // signalR.on('ReceiveNotification', handleNewNotification)

    return () => {
      // signalR.off('ReceiveNotification', handleNewNotification)
    }
  }, [dispatch])

  const handleMarkAsRead = useCallback(
    (id: string) => {
      dispatch(markAsRead(id))
      notificationHub.markAsRead(id)
    },
    [dispatch]
  )

  const handleMarkAllAsRead = useCallback(() => {
    dispatch(markAllAsRead())
    // Mark all as read on server
    items.forEach(item => {
      if (!item.read) {
        notificationHub.markAsRead(item.id)
      }
    })
  }, [dispatch, items])

  const handleRemoveNotification = useCallback(
    (id: string) => {
      dispatch(removeNotification(id))
    },
    [dispatch]
  )

  const handleClearAll = useCallback(() => {
    dispatch(clearAll())
  }, [dispatch])

  const handleToggleNotifications = useCallback(() => {
    dispatch(toggleNotifications())
  }, [dispatch])

  const handleSetNotificationsOpen = useCallback(
    (open: boolean) => {
      dispatch(setNotificationsOpen(open))
    },
    [dispatch]
  )

  // Send notification to user
  const sendToUser = useCallback(
    async (userId: string, notification: any) => {
      await notificationHub.sendToUser(userId, notification)
    },
    []
  )

  // Send notification to group
  const sendToGroup = useCallback(
    async (group: string, notification: any) => {
      await notificationHub.sendToGroup(group, notification)
    },
    []
  )

  return {
    notifications: items,
    unreadCount,
    isOpen,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    removeNotification: handleRemoveNotification,
    clearAll: handleClearAll,
    toggleNotifications: handleToggleNotifications,
    setNotificationsOpen: handleSetNotificationsOpen,
    sendToUser,
    sendToGroup,
  }
}