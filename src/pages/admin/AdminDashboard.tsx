import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/common/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalReports: number
  reportsThisMonth: number
  pendingReviews: number
  approvedReports: number
  rejectedReports: number
  averageResponseTime: string
  systemUptime: string
  storageUsed: string
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalReports: 0,
    reportsThisMonth: 0,
    pendingReviews: 0,
    approvedReports: 0,
    rejectedReports: 0,
    averageResponseTime: '0h',
    systemUptime: '99.9%',
    storageUsed: '0 GB',
  })

  // Mock data for charts
  const userActivityData = [
    { name: 'Mon', RMs: 4, QSs: 2, Admins: 1 },
    { name: 'Tue', RMs: 6, QSs: 3, Admins: 1 },
    { name: 'Wed', RMs: 8, QSs: 4, Admins: 2 },
    { name: 'Thu', RMs: 7, QSs: 3, Admins: 1 },
    { name: 'Fri', RMs: 9, QSs: 5, Admins: 2 },
    { name: 'Sat', RMs: 3, QSs: 1, Admins: 0 },
    { name: 'Sun', RMs: 2, QSs: 1, Admins: 0 },
  ]

  const reportsByStatusData = [
    { name: 'Draft', value: 15 },
    { name: 'Pending', value: 25 },
    { name: 'In Review', value: 20 },
    { name: 'Approved', value: 30 },
    { name: 'Rejected', value: 10 },
  ]

  const COLORS = ['#64748b', '#f59e0b', '#3b82f6', '#10b981', '#ef4444']

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'created a new report', time: '5 minutes ago', target: 'Site Visit - Project Alpha' },
    { id: 2, user: 'Jane Smith', action: 'approved a report', time: '15 minutes ago', target: 'Foundation Inspection' },
    { id: 3, user: 'Mike Johnson', action: 'added new user', time: '1 hour ago', target: 'Sarah Wilson (RM)' },
    { id: 4, user: 'System', action: 'completed daily backup', time: '2 hours ago', target: '2.3 GB backed up' },
    { id: 5, user: 'Emily Brown', action: 'requested revision', time: '3 hours ago', target: 'Electrical Assessment' },
  ]

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Mock API call - replace with actual
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStats({
        totalUsers: 45,
        activeUsers: 38,
        totalReports: 156,
        reportsThisMonth: 42,
        pendingReviews: 18,
        approvedReports: 89,
        rejectedReports: 12,
        averageResponseTime: '4.5h',
        systemUptime: '99.9%',
        storageUsed: '156 GB',
      })
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" label="Loading admin dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-secondary-600">
            Welcome back, {user?.name}. Here's your system overview.
          </p>
        </div>
        <div className="flex space-x-3">
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-primary-100 rounded-lg">
              <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-500">Total Users</p>
              <p className="text-2xl font-semibold text-secondary-900">{stats.totalUsers}</p>
              <p className="text-xs text-success">{stats.activeUsers} active now</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-info-100 rounded-lg">
              <svg className="h-6 w-6 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-500">Total Reports</p>
              <p className="text-2xl font-semibold text-secondary-900">{stats.totalReports}</p>
              <p className="text-xs text-info">{stats.reportsThisMonth} this month</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-warning-100 rounded-lg">
              <svg className="h-6 w-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-500">Pending Reviews</p>
              <p className="text-2xl font-semibold text-secondary-900">{stats.pendingReviews}</p>
              <p className="text-xs text-warning">Requires attention</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-secondary-100 rounded-lg">
              <svg className="h-6 w-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-500">Storage Used</p>
              <p className="text-2xl font-semibold text-secondary-900">{stats.storageUsed}</p>
              <p className="text-xs text-secondary-500">System uptime: {stats.systemUptime}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <Card>
          <h3 className="text-lg font-medium text-secondary-900 mb-4">User Activity (Last 7 Days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="RMs" fill="#3b82f6" />
                <Bar dataKey="QSs" fill="#10b981" />
                <Bar dataKey="Admins" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Reports by Status */}
        <Card>
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Reports by Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportsByStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportsByStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-medium text-secondary-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">CPU Usage</span>
                <span className="font-medium text-secondary-900">45%</span>
              </div>
              <div className="w-full bg-secondary-200 rounded-full h-2 mt-1">
                <div className="bg-primary-600 rounded-full h-2" style={{ width: '45%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Memory Usage</span>
                <span className="font-medium text-secondary-900">62%</span>
              </div>
              <div className="w-full bg-secondary-200 rounded-full h-2 mt-1">
                <div className="bg-success rounded-full h-2" style={{ width: '62%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Disk Usage</span>
                <span className="font-medium text-secondary-900">78%</span>
              </div>
              <div className="w-full bg-secondary-200 rounded-full h-2 mt-1">
                <div className="bg-warning rounded-full h-2" style={{ width: '78%' }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-700">
                      {activity.user.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-secondary-900">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-secondary-500">{activity.target}</p>
                  <p className="text-xs text-secondary-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard