import React, { useState, useEffect } from 'react'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatDateTime } from '@/utils/formatters/dateFormatter'
import toast from 'react-hot-toast'

interface AuditLog {
  id: string
  timestamp: Date
  user: string
  action: string
  resource: string
  resourceId: string
  details: string
  ipAddress: string
  userAgent: string
  status: 'success' | 'failure'
}

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadAuditLogs()
  }, [dateRange])

  const loadAuditLogs = async () => {
    setIsLoading(true)
    try {
      // Mock API call - replace with actual
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate mock data
      const mockLogs: AuditLog[] = Array.from({ length: 50 }, (_, i) => ({
        id: `log-${i}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        user: ['John Doe', 'Jane Smith', 'Mike Johnson', 'System'][Math.floor(Math.random() * 4)],
        action: ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', 'EXPORT'][Math.floor(Math.random() * 7)],
        resource: ['User', 'Report', 'Client', 'Setting', 'Permission'][Math.floor(Math.random() * 5)],
        resourceId: `ID-${Math.floor(Math.random() * 1000)}`,
        details: `Performed action on resource`,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0...',
        status: Math.random() > 0.1 ? 'success' : 'failure',
      })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      
      setLogs(mockLogs)
    } catch (error) {
      toast.error('Failed to load audit logs')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLogs = logs.filter(log =>
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resourceId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleExport = () => {
    // Implement export functionality
    toast.success('Logs exported successfully')
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-success/10 text-success'
      case 'UPDATE':
        return 'bg-info/10 text-info'
      case 'DELETE':
        return 'bg-error/10 text-error'
      case 'LOGIN':
      case 'LOGOUT':
        return 'bg-primary/10 text-primary'
      default:
        return 'bg-secondary-100 text-secondary-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" label="Loading audit logs..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Audit Logs</h1>
          <p className="mt-1 text-sm text-secondary-600">
            View system activity and audit trail
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          leftIcon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        >
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          <Input
            type="date"
            label="Start Date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          />
          <Input
            type="date"
            label="End Date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          />
        </div>
      </Card>

      {/* Logs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Resource ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-secondary-900">{log.user}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    {log.resource}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    {log.resourceId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      log.status === 'success' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-error/10 text-error'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedLog(log)
                        setShowDetails(true)
                      }}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Log Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          title="Audit Log Details"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-secondary-500">Timestamp</p>
                <p className="text-sm font-medium text-secondary-900">
                  {formatDateTime(selectedLog.timestamp)}
                </p>
              </div>
              <div>
                <p className="text-xs text-secondary-500">User</p>
                <p className="text-sm font-medium text-secondary-900">{selectedLog.user}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-500">Action</p>
                <p className="text-sm font-medium text-secondary-900">{selectedLog.action}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-500">Status</p>
                <p className={`text-sm font-medium ${
                  selectedLog.status === 'success' ? 'text-success' : 'text-error'
                }`}>
                  {selectedLog.status}
                </p>
              </div>
              <div>
                <p className="text-xs text-secondary-500">Resource Type</p>
                <p className="text-sm font-medium text-secondary-900">{selectedLog.resource}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-500">Resource ID</p>
                <p className="text-sm font-medium text-secondary-900">{selectedLog.resourceId}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-secondary-500">Details</p>
                <p className="text-sm text-secondary-900 mt-1">{selectedLog.details}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-secondary-500">IP Address</p>
                <p className="text-sm text-secondary-900">{selectedLog.ipAddress}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-secondary-500">User Agent</p>
                <p className="text-sm text-secondary-900 break-all">{selectedLog.userAgent}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AuditLogs