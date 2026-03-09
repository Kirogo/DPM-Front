// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { SignalRProvider } from './contexts/SignalRContext'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import RMDashboard from './pages/rm/RMDashboard'
import CreateReport from './pages/rm/CreateReport'
import EditReport from './pages/rm/EditReport'
import MyReports from './pages/rm/MyReports'
import ReportDetail from './pages/rm/ReportDetail'
import ReportPrint from './pages/rm/ReportPrint'
import RMChecklistPage from './pages/rm/RMChecklistPage'
import RMChecklistDetailPage from './pages/rm/RMChecklistDetailPage'
import AllReportsPage from './pages/rm/AllReportsPage'
import RMReportsPage from './pages/rm/RMReportsPage'
import ReportViewPage from './pages/rm/ReportViewPage'
import DraftsPage from './pages/rm/DraftsPage'
import ApprovedPage from './pages/rm/ApprovedPage'

// Test routes
import TestReportsPage from './pages/rm/TestReportsPage'
import TestReportDetailPage from './pages/rm/TestReportDetailPage'

// QS Pages
import QSDashboard from './pages/qs/QSDashboard'
import QSReviewsPage from './pages/qs/QSReviewsPage'
import QSReviewDetailPage from './pages/qs/QSReviewDetailPage'
import QSSiteVisitsPage from './pages/qs/QSSiteVisitsPage'
import QSSchedulePage from './pages/qs/QSSchedulePage'
import QSAnalyticsPage from './pages/qs/QSAnalyticsPage'
import QSReportsPage from './pages/qs/QSReportsPage'

// Admin Routes
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import ClientManagement from './pages/admin/ClientManagement'
import AuditLogs from './pages/admin/AuditLogs'
import SystemSettings from './pages/admin/SystemSettings'

import { DashboardRedirect } from './components/common/DashboardRedirect'
import Profile from './pages/shared/Profile'
import Notifications from './pages/shared/Notifications'
import Settings from './pages/shared/Settings'

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <SignalRProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />

          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              {/* Dashboard Redirect */}
              <Route index element={<DashboardRedirect />} />
              <Route path="/dashboard" element={<DashboardRedirect />} />

              {/* Shared Routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />

              {/* RM Dashboard */}
              <Route path="/rm" element={<RMDashboard />} />

              {/* NEW: Tabbed Reports Page */}
              <Route path="/rm/reports" element={<RMReportsPage />} />

              {/* IMPORTANT: Order matters - specific routes before dynamic ones */}
              
              {/* Read-only view for submitted/approved reports - THIS IS THE KEY ROUTE */}
              <Route path="/rm/reports/:id/view" element={<ReportViewPage />} />

              {/* Legacy RM Routes */}
              <Route path="/rm/reports/create" element={<CreateReport />} />
              <Route path="/rm/reports/:id" element={<ReportDetail />} />
              <Route path="/rm/reports/edit/:id" element={<EditReport />} />
              <Route path="/rm/reports/:id/print" element={<ReportPrint />} />
              <Route path="/rm/my-reports" element={<MyReports />} />

              {/* Drafts and Approved pages */}
              <Route path="/rm/drafts" element={<DraftsPage />} />
              <Route path="/rm/approved" element={<ApprovedPage />} />
              <Route path="/rm/all-reports" element={<AllReportsPage />} />

              {/* Checklist/Step-by-Step Routes - These are for EDITABLE reports */}
              <Route path="/rm/checklists" element={<RMChecklistPage />} />
              <Route path="/rm/checklists/:id" element={<RMChecklistDetailPage />} />

              {/* Test Routes */}
              <Route path="/rm/test-reports" element={<TestReportsPage />} />
              <Route path="/rm/test-reports/:id" element={<TestReportDetailPage />} />

              {/* QS Routes - Updated with nested structure */}
              <Route path="/qs" element={<QSDashboard />} />
              <Route path="/qs/dashboard" element={<QSDashboard />} />

              {/* QS Reviews with nested routes - ORDER MATTERS! */}
              <Route path="/qs/reviews">
                {/* Index route for /qs/reviews - defaults to pending */}
                <Route index element={<QSReviewsPage />} />
                
                {/* Tab routes - these must come BEFORE the :id route */}
                <Route path="pending" element={<QSReviewsPage />} />
                <Route path="progress" element={<QSReviewsPage />} />
                <Route path="completed" element={<QSReviewsPage />} />
                
                {/* Detail route - this must come AFTER tab routes */}
                <Route path=":id" element={<QSReviewDetailPage />} />
              </Route>

              {/* Other QS Routes */}
              <Route path="/qs/reports" element={<QSReportsPage />} />
              <Route path="/qs/site-visits" element={<QSSiteVisitsPage />} />
              <Route path="/qs/schedule" element={<QSSchedulePage />} />
              <Route path="/qs/analytics" element={<QSAnalyticsPage />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/clients" element={<ClientManagement />} />
              <Route path="/admin/audit-logs" element={<AuditLogs />} />
              <Route path="/admin/settings" element={<SystemSettings />} />
            </Route>

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </SignalRProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App