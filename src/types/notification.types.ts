export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
    id: string
    title: string
    message: string
    type: NotificationType
    read: boolean
    createdAt: string
    link?: string
    data?: any
}

export interface NotificationState {
    items: Notification[]
    unreadCount: number
    isLoading: boolean
    error: string | null
    isOpen: boolean
}
