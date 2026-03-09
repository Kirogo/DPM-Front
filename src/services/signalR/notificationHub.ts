//src/services/signalR/notificationHub.ts
import * as signalR from '@microsoft/signalr'
import { store } from '@/store/store'
import { addNotification } from '@/store/slices/notificationSlice'

class NotificationHubService {
  private connection: signalR.HubConnection | null = null
  private isConnected = false

  async startConnection() {
    const token = store.getState().auth.token
    const hubUrl = import.meta.env.VITE_SIGNALR_URL

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${hubUrl}/notificationHub`, {
        accessTokenFactory: () => token || '',
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build()

    this.registerEvents()

    try {
      await this.connection.start()
      this.isConnected = true
      console.log('SignalR Connected')
    } catch (err) {
      console.error('SignalR Connection Error: ', err)
    }
  }

  private registerEvents() {
    if (!this.connection) return

    this.connection.on('ReceiveNotification', (notification) => {
      store.dispatch(addNotification(notification))
      
      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/assets/icons/icon-192x192.png',
        })
      }
    })

    this.connection.on('ReportStatusChanged', (data) => {
      console.log('Report status changed:', data)
      // Handle report status change
    })

    this.connection.on('NewComment', (data) => {
      console.log('New comment:', data)
      // Handle new comment
    })

    this.connection.on('DecisionMade', (data) => {
      console.log('Decision made:', data)
      // Handle decision
    })
  }

  async stopConnection() {
    if (this.connection) {
      await this.connection.stop()
      this.isConnected = false
    }
  }

  // Send notifications to specific user
  async sendToUser(userId: string, notification: any) {
    if (this.isConnected && this.connection) {
      await this.connection.invoke('SendToUser', userId, notification)
    }
  }

  // Send to group (role-based)
  async sendToGroup(group: string, notification: any) {
    if (this.isConnected && this.connection) {
      await this.connection.invoke('SendToGroup', group, notification)
    }
  }

  // Join a group
  async joinGroup(group: string) {
    if (this.isConnected && this.connection) {
      await this.connection.invoke('JoinGroup', group)
    }
  }

  // Leave a group
  async leaveGroup(group: string) {
    if (this.isConnected && this.connection) {
      await this.connection.invoke('LeaveGroup', group)
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string) {
    if (this.isConnected && this.connection) {
      await this.connection.invoke('MarkAsRead', notificationId)
    }
  }
}

export default new NotificationHubService()