// src/services/lockService.ts
export interface LockInfo {
  isLocked: boolean
  lockedBy?: {
    id: string
    name: string
    role?: string
    email?: string
  }
  lockedAt?: string
  expiresAt?: string
  sessionId?: string
  isCurrentUser?: boolean
  isCurrentSession?: boolean
  message?: string
  code?: string
}

export interface UserActiveLock {
  reportId: string
  reportNo: string
  lockedAt: string
  expiresAt: string
  sessionId: string
}

class LockService {
  private lockCheckInterval: Map<string, NodeJS.Timeout> = new Map()
  private heartbeatInterval: Map<string, NodeJS.Timeout> = new Map()
  private reportLocks: Map<string, boolean> = new Map()
  private apiBaseUrl: string
  private isUnlocking: Map<string, boolean> = new Map()
  private sessionId: string
  private lockAttempts: Map<string, number> = new Map()
  private maxRetries: number = 3
  private isAcquiring: Map<string, boolean> = new Map()

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    const existing = sessionStorage.getItem('lock_session_id')
    if (existing) return existing
    
    const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${crypto.randomUUID?.() || Math.random().toString(36)}`
    sessionStorage.setItem('lock_session_id', newId)
    return newId
  }

  getSessionId(): string {
    return this.sessionId
  }

  private getToken(): string | null {
    return localStorage.getItem('token')
  }

  private getHeaders() {
    const token = this.getToken()
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'X-Session-Id': this.sessionId
    }
  }

  isTokenValid(): boolean {
    return !!this.getToken()
  }

  // DISABLED FOR DEMO - Always returns null (no lock)
  async checkUserActiveLock(): Promise<UserActiveLock | null> {
    // DEMO MODE: Lock mechanism disabled
    console.log('🔓 Lock mechanism disabled for demo - checkUserActiveLock bypassed')
    return null
    
    // Original code commented out:
    /*
    try {
      const token = this.getToken()
      if (!token) return null

      const response = await fetch(`${this.apiBaseUrl}/Lock/user-active-lock`, {
        headers: this.getHeaders()
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Unauthorized when checking user active lock')
          return null
        }
        return null
      }
      
      const text = await response.text()
      if (!text) return null
      
      try {
        const data = JSON.parse(text)
        if (!data || !data.reportId) return null
        
        return {
          reportId: data.reportId || '',
          reportNo: data.reportNo || 'Unknown',
          lockedAt: data.lockedAt || new Date().toISOString(),
          expiresAt: data.expiresAt || new Date().toISOString(),
          sessionId: data.sessionId || ''
        }
      } catch (e) {
        return null
      }
    } catch (error) {
      console.error('Failed to check user active lock:', error)
      return null
    }
    */
  }

  // DISABLED FOR DEMO - Always returns success with no lock
  async lockReport(reportId: string, userId: string, userName: string, userRole: string = 'RM'): Promise<LockInfo> {
    // DEMO MODE: Lock mechanism disabled
    console.log('🔓 Lock mechanism disabled for demo - lockReport bypassed')
    return {
      isLocked: true,
      lockedBy: {
        id: userId,
        name: userName,
        role: userRole
      },
      lockedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      sessionId: this.sessionId,
      isCurrentUser: true,
      isCurrentSession: true,
      message: "Lock acquired successfully (DEMO MODE)"
    }
    
    // Original code commented out:
    /*
    if (this.isAcquiring.get(reportId)) {
      console.log('Lock acquisition already in progress for report:', reportId)
      throw new Error('lock_acquisition_in_progress')
    }

    this.isAcquiring.set(reportId, true)

    try {
      const attempts = this.lockAttempts.get(reportId) || 0
      if (attempts >= this.maxRetries) {
        this.lockAttempts.delete(reportId)
        this.isAcquiring.delete(reportId)
        throw new Error('max_retries_exceeded')
      }

      this.lockAttempts.set(reportId, attempts + 1)

      const token = this.getToken()
      if (!token) {
        this.isAcquiring.delete(reportId)
        throw new Error('token_expired')
      }

      try {
        const userActiveLock = await this.checkUserActiveLock()
        if (userActiveLock && userActiveLock.reportId && userActiveLock.reportId !== reportId) {
          this.isAcquiring.delete(reportId)
          throw new Error(`user_has_active_lock:${userActiveLock.reportId}:${userActiveLock.reportNo || 'Unknown'}`)
        }
      } catch (error) {
        if (error instanceof Error && error.message?.startsWith('user_has_active_lock')) {
          this.isAcquiring.delete(reportId)
          throw error
        }
      }

      console.log('Attempting to acquire lock for report:', reportId)
      console.log('Using session ID:', this.sessionId)
      console.log('Token exists:', !!token)

      const response = await fetch(`${this.apiBaseUrl}/Lock/acquire`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          reportId,
          userId,
          userName,
          userRole,
          sessionId: this.sessionId,
          lockDurationMinutes: 5
        })
      })

      this.lockAttempts.delete(reportId)

      if (!response.ok) {
        if (response.status === 401) {
          console.error('401 Unauthorized - token may be invalid')
          this.isAcquiring.delete(reportId)
          throw new Error('token_expired')
        }
        
        if (response.status === 409) {
          const errorData = await response.json().catch(() => ({}))
          if (errorData.code === 'USER_HAS_ACTIVE_LOCK') {
            const reportNo = errorData.existingLock?.reportNo || 'Unknown'
            const existingReportId = errorData.existingLock?.reportId || ''
            this.isAcquiring.delete(reportId)
            throw new Error(`user_has_active_lock:${existingReportId}:${reportNo}`)
          }
          this.isAcquiring.delete(reportId)
          throw new Error(`locked_by_other:${errorData.lockedBy?.name || 'Another user'}:${errorData.lockedBy?.role || 'RM'}:${errorData.expiresAt || ''}`)
        }
        
        const errorData = await response.json().catch(() => ({}))
        this.isAcquiring.delete(reportId)
        throw new Error(errorData.message || 'Failed to lock report')
      }

      const data = await response.json()
      console.log('Lock acquired successfully:', data)

      this.reportLocks.set(reportId, true)
      this.startHeartbeat(reportId, userId)
      this.isAcquiring.delete(reportId)
      
      return data
    } catch (error) {
      console.error('Lock acquisition error:', error)
      this.isAcquiring.delete(reportId)
      throw error
    }
    */
  }

  // DISABLED FOR DEMO - No-op
  async unlockReport(reportId: string, userId: string, reason: string = 'user_action'): Promise<void> {
    // DEMO MODE: Lock mechanism disabled
    console.log('🔓 Lock mechanism disabled for demo - unlockReport bypassed')
    return
    
    // Original code commented out:
    /*
    if (this.isUnlocking.get(reportId)) return

    this.isUnlocking.set(reportId, true)
    
    try {
      const token = this.getToken()
      if (!token) {
        this.reportLocks.delete(reportId)
        this.stopHeartbeat(reportId)
        this.isUnlocking.delete(reportId)
        return
      }

      await fetch(`${this.apiBaseUrl}/Lock/release`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ 
          reportId, 
          userId, 
          sessionId: this.sessionId,
          reason 
        })
      })
      
      this.reportLocks.delete(reportId)
      this.stopHeartbeat(reportId)
    } catch (error) {
      console.error('Error unlocking report:', error)
    } finally {
      this.isUnlocking.delete(reportId)
      this.stopLockCheck(reportId)
    }
    */
  }

  // DISABLED FOR DEMO - Always returns not locked
  async checkLockStatus(reportId: string): Promise<LockInfo> {
    // DEMO MODE: Lock mechanism disabled
    console.log('🔓 Lock mechanism disabled for demo - checkLockStatus bypassed')
    return { 
      isLocked: false,
      message: "Lock mechanism disabled for demo"
    }
    
    // Original code commented out:
    /*
    try {
      const token = this.getToken()
      if (!token) {
        return { isLocked: false }
      }

      const response = await fetch(`${this.apiBaseUrl}/Lock/status/${reportId}`, {
        headers: this.getHeaders()
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          return { isLocked: false }
        }
        return { isLocked: false }
      }
      
      return await response.json()
    } catch (error) {
      console.error('Lock status check failed:', error)
      return { isLocked: false }
    }
    */
  }

  // DISABLED FOR DEMO - No-op
  async sendHeartbeat(reportId: string, userId: string): Promise<void> {
    // DEMO MODE: Lock mechanism disabled
    return
    
    // Original code commented out:
    /*
    try {
      if (!this.reportLocks.get(reportId)) return

      await fetch(`${this.apiBaseUrl}/Lock/heartbeat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          reportId,
          userId,
          sessionId: this.sessionId
        })
      })
    } catch (error) {
      console.error('Heartbeat failed:', error)
    }
    */
  }

  private startHeartbeat(reportId: string, userId: string) {
    // DISABLED FOR DEMO
    return
    
    /*
    this.stopHeartbeat(reportId)
    const interval = setInterval(() => {
      this.sendHeartbeat(reportId, userId)
    }, 120000)
    this.heartbeatInterval.set(reportId, interval)
    */
  }

  private stopHeartbeat(reportId: string) {
    const interval = this.heartbeatInterval.get(reportId)
    if (interval) {
      clearInterval(interval)
      this.heartbeatInterval.delete(reportId)
    }
  }

  // DISABLED FOR DEMO - No-op
  startLockCheck(reportId: string, onLockChanged: (isLocked: boolean, info?: LockInfo) => void) {
    // DEMO MODE: Lock mechanism disabled
    console.log('🔓 Lock mechanism disabled for demo - startLockCheck bypassed')
    return
    
    /*
    this.stopLockCheck(reportId)

    const interval = setInterval(async () => {
      const status = await this.checkLockStatus(reportId)
      const wasLocked = this.reportLocks.get(reportId) || false

      if (status.isLocked !== wasLocked) {
        this.reportLocks.set(reportId, status.isLocked)
        onLockChanged(status.isLocked, status)
      }
      
      if (!status.isLocked && wasLocked) {
        this.stopHeartbeat(reportId)
      }
    }, 10000)

    this.lockCheckInterval.set(reportId, interval)
    */
  }

  stopLockCheck(reportId: string) {
    const interval = this.lockCheckInterval.get(reportId)
    if (interval) {
      clearInterval(interval)
      this.lockCheckInterval.delete(reportId)
    }
  }

  stopAllChecks(reportId: string) {
    this.stopLockCheck(reportId)
    this.stopHeartbeat(reportId)
  }

  hasLock(reportId: string): boolean {
    return this.reportLocks.get(reportId) || false
  }

  // DISABLED FOR DEMO - No-op
  setupBeforeUnload(reportId: string, userId: string) {
    // DEMO MODE: Lock mechanism disabled
    return () => {}
    
    /*
    const handleBeforeUnload = () => {
      if (this.hasLock(reportId)) {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `${this.apiBaseUrl}/Lock/release`, false)
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.setRequestHeader('Authorization', `Bearer ${this.getToken()}`)
        xhr.setRequestHeader('X-Session-Id', this.sessionId)
        xhr.send(JSON.stringify({
          reportId,
          userId,
          sessionId: this.sessionId,
          reason: 'tab_close'
        }))
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    */
  }

  resetSession() {
    this.sessionId = this.generateSessionId()
    this.reportLocks.clear()
    this.heartbeatInterval.forEach((_, key) => this.stopHeartbeat(key))
    this.lockCheckInterval.forEach((_, key) => this.stopLockCheck(key))
    this.lockAttempts.clear()
    this.isAcquiring.clear()
  }
}

export const lockService = new LockService()