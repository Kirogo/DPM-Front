import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionable?: boolean
  actionUrl?: string
  metadata?: Record<string, any>
}

interface NotificationState {
  items: Notification[]
  unreadCount: number
  isOpen: boolean
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  isOpen: false,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload)
      state.unreadCount += 1
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(n => n.id === action.payload)
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount -= 1
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(n => { n.read = true })
      state.unreadCount = 0
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.items.findIndex(n => n.id === action.payload)
      if (index !== -1) {
        if (!state.items[index].read) {
          state.unreadCount -= 1
        }
        state.items.splice(index, 1)
      }
    },
    clearAll: (state) => {
      state.items = []
      state.unreadCount = 0
    },
    toggleNotifications: (state) => {
      state.isOpen = !state.isOpen
    },
    setNotificationsOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload
    },
  },
})

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAll,
  toggleNotifications,
  setNotificationsOpen,
} = notificationSlice.actions

export default notificationSlice.reducer