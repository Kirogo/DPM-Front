import React, { useState } from 'react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { toast } from 'react-hot-toast'

interface Settings {
  general: {
    companyName: string
    systemName: string
    supportEmail: string
    supportPhone: string
    timezone: string
    dateFormat: string
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    reportSubmitted: boolean
    reportReviewed: boolean
    commentAdded: boolean
    dailyDigest: boolean
  }
  security: {
    sessionTimeout: number
    maxLoginAttempts: number
    passwordExpiry: number
    twoFactorAuth: boolean
    ipWhitelist: string[]
  }
  storage: {
    maxFileSize: number
    allowedFileTypes: string[]
    retentionPeriod: number
    backupFrequency: string
  }
}

export const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'storage'>('general')
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    general: {
      companyName: 'GeoBuild Inc.',
      systemName: 'GeoBuild Site Management',
      supportEmail: 'support@geobuild.com',
      supportPhone: '+1 (555) 123-4567',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      reportSubmitted: true,
      reportReviewed: true,
      commentAdded: true,
      dailyDigest: false,
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordExpiry: 90,
      twoFactorAuth: false,
      ipWhitelist: ['192.168.1.0/24'],
    },
    storage: {
      maxFileSize: 10,
      allowedFileTypes: ['jpg', 'png', 'pdf', 'doc'],
      retentionPeriod: 365,
      backupFrequency: 'daily',
    },
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      // Reset to default settings
      toast.success('Settings reset to default')
    }
  }

  const tabs = [
    {
      id: 'general', label: 'General', icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      )
    },
    {
      id: 'notifications', label: 'Notifications', icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },
    {
      id: 'security', label: 'Security', icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      id: 'storage', label: 'Storage', icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      )
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">System Settings</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Configure system preferences and options
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="border-b border-secondary-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }
              `}
            >
              <span className={activeTab === tab.id ? 'text-primary-500' : 'text-secondary-400'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      <Card>
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-secondary-900">General Settings</h3>

            <div className="grid grid-cols-2 gap-6">
              <Input
                label="Company Name"
                value={settings.general.companyName}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, companyName: e.target.value }
                })}
              />
              <Input
                label="System Name"
                value={settings.general.systemName}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, systemName: e.target.value }
                })}
              />
              <Input
                label="Support Email"
                type="email"
                value={settings.general.supportEmail}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, supportEmail: e.target.value }
                })}
              />
              <Input
                label="Support Phone"
                value={settings.general.supportPhone}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, supportPhone: e.target.value }
                })}
              />
              <Input
                label="Timezone"
                value={settings.general.timezone}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, timezone: e.target.value }
                })}
              />
              <Input
                label="Date Format"
                value={settings.general.dateFormat}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, dateFormat: e.target.value }
                })}
              />
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-secondary-900">Notification Settings</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-secondary-900">Email Notifications</p>
                  <p className="text-sm text-secondary-500">Receive notifications via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, emailNotifications: e.target.checked }
                    })}
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-secondary-900">Push Notifications</p>
                  <p className="text-sm text-secondary-500">Receive push notifications in browser</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.pushNotifications}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, pushNotifications: e.target.checked }
                    })}
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="pt-4 border-t border-secondary-200">
                <p className="font-medium text-secondary-900 mb-4">Notify me when...</p>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="reportSubmitted"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                      checked={settings.notifications.reportSubmitted}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, reportSubmitted: e.target.checked }
                      })}
                    />
                    <label htmlFor="reportSubmitted" className="ml-3 text-sm text-secondary-700">
                      A report is submitted for review
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="reportReviewed"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                      checked={settings.notifications.reportReviewed}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, reportReviewed: e.target.checked }
                      })}
                    />
                    <label htmlFor="reportReviewed" className="ml-3 text-sm text-secondary-700">
                      A report is reviewed
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="commentAdded"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                      checked={settings.notifications.commentAdded}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, commentAdded: e.target.checked }
                      })}
                    />
                    <label htmlFor="commentAdded" className="ml-3 text-sm text-secondary-700">
                      A comment is added to my reports
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="dailyDigest"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                      checked={settings.notifications.dailyDigest}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, dailyDigest: e.target.checked }
                      })}
                    />
                    <label htmlFor="dailyDigest" className="ml-3 text-sm text-secondary-700">
                      Send daily digest email
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-secondary-900">Security Settings</h3>

            <div className="grid grid-cols-2 gap-6">
              <Input
                type="number"
                label="Session Timeout (minutes)"
                value={settings.security.sessionTimeout}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                })}
              />
              <Input
                type="number"
                label="Max Login Attempts"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                })}
              />
              <Input
                type="number"
                label="Password Expiry (days)"
                value={settings.security.passwordExpiry}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, passwordExpiry: parseInt(e.target.value) }
                })}
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="font-medium text-secondary-900">Two-Factor Authentication</p>
                <p className="text-sm text-secondary-500">Require 2FA for all users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, twoFactorAuth: e.target.checked }
                  })}
                />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                IP Whitelist (one per line)
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={settings.security.ipWhitelist.join('\n')}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, ipWhitelist: e.target.value.split('\n').filter(Boolean) }
                })}
                placeholder="192.168.1.0/24&#10;10.0.0.0/8"
              />
            </div>
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-secondary-900">Storage Settings</h3>

            <div className="grid grid-cols-2 gap-6">
              <Input
                type="number"
                label="Max File Size (MB)"
                value={settings.storage.maxFileSize}
                onChange={(e) => setSettings({
                  ...settings,
                  storage: { ...settings.storage, maxFileSize: parseInt(e.target.value) }
                })}
              />
              <Input
                type="number"
                label="Retention Period (days)"
                value={settings.storage.retentionPeriod}
                onChange={(e) => setSettings({
                  ...settings,
                  storage: { ...settings.storage, retentionPeriod: parseInt(e.target.value) }
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Allowed File Types (comma separated)
              </label>
              <Input
                value={settings.storage.allowedFileTypes.join(', ')}
                onChange={(e) => setSettings({
                  ...settings,
                  storage: { ...settings.storage, allowedFileTypes: e.target.value.split(',').map(t => t.trim()) }
                })}
                placeholder="jpg, png, pdf, doc"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Backup Frequency
              </label>
              <select
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={settings.storage.backupFrequency}
                onChange={(e) => setSettings({
                  ...settings,
                  storage: { ...settings.storage, backupFrequency: e.target.value }
                })}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Storage Usage */}
            <div className="pt-4 border-t border-secondary-200">
              <h4 className="font-medium text-secondary-900 mb-4">Current Storage Usage</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Database</span>
                    <span className="font-medium text-secondary-900">2.3 GB</span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2 mt-1">
                    <div className="bg-primary-600 rounded-full h-2" style={{ width: '35%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Photos & Attachments</span>
                    <span className="font-medium text-secondary-900">156 GB</span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2 mt-1">
                    <div className="bg-success rounded-full h-2" style={{ width: '78%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Backups</span>
                    <span className="font-medium text-secondary-900">450 GB</span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2 mt-1">
                    <div className="bg-warning rounded-full h-2" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default SystemSettings