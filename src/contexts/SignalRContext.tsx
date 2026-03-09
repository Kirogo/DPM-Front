// src/contexts/SignalRContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react'

// Define the types without importing from SignalR to avoid any potential issues
enum HubConnectionState {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Reconnecting = 'Reconnecting',
}

interface SignalRContextType {
  connection: null
  connectionState: HubConnectionState
  isConnected: boolean
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined)

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Simple state without any SignalR logic
  const [connectionState] = useState<HubConnectionState>(HubConnectionState.Disconnected)

  // Don't attempt any connections - just provide default values
  const value = {
    connection: null,
    connectionState,
    isConnected: false,
  }

  // Optional: Log that SignalR is disabled
  useEffect(() => {
    console.log('🔌 SignalR is disabled (backend hub not implemented)')
  }, [])

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  )
}

export const useSignalR = (): SignalRContextType => {
  const context = useContext(SignalRContext)
  if (context === undefined) {
    throw new Error('useSignalR must be used within a SignalRProvider')
  }
  return context
}