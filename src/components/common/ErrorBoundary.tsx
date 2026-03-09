// src/components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ Error caught by boundary:', error)
    console.error('Component stack:', errorInfo.componentStack)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#F5F7F4',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            textAlign: 'center',
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#1A3636', marginBottom: '16px' }}>
              ⚠️ Something went wrong
            </h2>
            <p style={{ color: '#677D6A', marginBottom: '24px', fontSize: '14px' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            
            {/* Show component stack for debugging */}
            {this.state.errorInfo && (
              <div style={{
                textAlign: 'left',
                backgroundColor: '#f8f8f8',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                overflow: 'auto',
                maxHeight: '200px',
                fontSize: '12px',
                color: '#666'
              }}>
                <strong>Component Stack:</strong>
                <pre style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
            
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px',
                backgroundColor: '#1A3636',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#40534C'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1A3636'}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary