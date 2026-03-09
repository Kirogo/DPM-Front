//src/store/slices/reportSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { reportsApi } from '@/services/api/reportsApi'
import {
  SiteVisitReport,
  ReportFilter,
  CreateReportDto,
  UpdateReportDto,
  SubmitReportDto
} from '@/types/report.types'
import { GeotaggedPhoto } from '@/types/geotag.types'

interface ReportState {
  reports: SiteVisitReport[]
  currentReport: SiteVisitReport | null
  filters: ReportFilter
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number
  uploadQueue: GeotaggedPhoto[]
  uploadProgress: Record<string, number>
}

const initialState: ReportState = {
  reports: [],
  currentReport: null,
  filters: {},
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
  uploadQueue: [],
  uploadProgress: {},
}

export const fetchReports = createAsyncThunk(
  'reports/fetchAll',
  async ({ page = 1, pageSize = 10, filters = {} }:
    { page?: number; pageSize?: number; filters?: ReportFilter }) => {
    const response = await reportsApi.getReports({ page, pageSize, ...filters })
    const mapStatus = (s?: string) => {
      if (!s) return s
      const lower = s.toString().toLowerCase()
      switch (lower) {
        case 'draft': return 'draft'
        case 'pendingqsreview':
        case 'pendingqs_review':
        case 'pending_qsreview':
        case 'pending_qs_review': return 'pending_qs_review'
        case 'underreview':
        case 'under_review': return 'under_review'
        case 'revisionrequested':
        case 'revision_requested': return 'revision_requested'
        case 'sitevisitscheduled':
        case 'site_visit_scheduled': return 'site_visit_scheduled'
        case 'approved': return 'approved'
        case 'rejected': return 'rejected'
        case 'archived': return 'archived'
        default: return lower
      }
    }

    // Normalize items' status fields for frontend
    const data = response.data
    if (data?.items && Array.isArray(data.items)) {
      data.items = data.items.map((it: any) => ({ ...it, status: mapStatus(it.status) }))
    }
    if (data?.item) {
      data.item = { ...data.item, status: mapStatus(data.item.status) }
    }
    return data
  }
)

export const fetchMyReports = createAsyncThunk(
  'reports/fetchMyReports',
  async ({ page = 1, pageSize = 10, filters = {} }:
    { page?: number; pageSize?: number; filters?: ReportFilter }) => {
    const response = await reportsApi.getMyReports(page, pageSize, filters)
    const data = response.data
    if (data?.items && Array.isArray(data.items)) {
      data.items = data.items.map((it: any) => ({ ...it, status: (it.status || '').toString().toLowerCase() }))
    }
    return data
  }
)

export const fetchReportById = createAsyncThunk(
  'reports/fetchById',
  async (id: string) => {
    const response = await reportsApi.getReportById(id)
    const item = response.data
    if (item) item.status = (item.status || '').toString().toLowerCase()
    return item
  }
)

export const createReport = createAsyncThunk(
  'reports/create',
  async (data: CreateReportDto) => {
    const response = await reportsApi.createReport(data)
    return response.data
  }
)

export const updateReport = createAsyncThunk(
  'reports/update',
  async (data: UpdateReportDto) => {
    const response = await reportsApi.updateReport(data.id, data)
    return response.data
  }
)

export const submitReport = createAsyncThunk(
  'reports/submit',
  async (data: SubmitReportDto) => {
    const response = await reportsApi.submitReport(data.reportId, data)
    return response.data
  }
)

export const uploadPhoto = createAsyncThunk(
  'reports/uploadPhoto',
  async ({ reportId, photo, onProgress }:
    { reportId: string; photo: GeotaggedPhoto; onProgress?: (progress: number) => void }) => {
    const response = await reportsApi.uploadPhoto(reportId, photo, onProgress)
    return response.data
  }
)

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ReportFilter>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    addToUploadQueue: (state, action: PayloadAction<GeotaggedPhoto>) => {
      state.uploadQueue.push(action.payload)
    },
    removeFromUploadQueue: (state, action: PayloadAction<string>) => {
      state.uploadQueue = state.uploadQueue.filter(p => p.id !== action.payload)
    },
    setUploadProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      state.uploadProgress[action.payload.id] = action.payload.progress
    },
    clearUploadQueue: (state) => {
      state.uploadQueue = []
      state.uploadProgress = {}
    },
    clearCurrentReport: (state) => {
      state.currentReport = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reports
      .addCase(fetchReports.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isLoading = false
        state.reports = action.payload.items
        state.totalCount = action.payload.total
        state.currentPage = action.payload.page
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch reports'
      })
      // Fetch My Reports
      .addCase(fetchMyReports.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyReports.fulfilled, (state, action) => {
        state.isLoading = false
        state.reports = action.payload.items
        state.totalCount = action.payload.total
        state.currentPage = action.payload.page
      })
      .addCase(fetchMyReports.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch reports'
      })
      // Fetch Single Report
      .addCase(fetchReportById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.isLoading = false
        // Normalize the status
        if (action.payload) {
          const status = action.payload.status?.toLowerCase()
          action.payload.status = status
        }
        state.currentReport = action.payload
      })
      .addCase(fetchReportById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch report'
      })
      // Create Report
      .addCase(createReport.fulfilled, (state, action) => {
        state.reports.unshift(action.payload)
        state.currentReport = action.payload
      })
      // Update Report
      .addCase(updateReport.fulfilled, (state, action) => {
        const index = state.reports.findIndex(r => r.id === action.payload.id)
        if (index !== -1) {
          state.reports[index] = action.payload
        }
        if (state.currentReport?.id === action.payload.id) {
          state.currentReport = action.payload
        }
      })
      // Submit Report
      .addCase(submitReport.fulfilled, (state, action) => {
        const index = state.reports.findIndex(r => r.id === action.payload.id)
        if (index !== -1) {
          state.reports[index] = action.payload
        }
        if (state.currentReport?.id === action.payload.id) {
          state.currentReport = action.payload
        }
      })
  },
})

export const {
  setFilters,
  clearFilters,
  setCurrentPage,
  addToUploadQueue,
  removeFromUploadQueue,
  setUploadProgress,
  clearUploadQueue,
  clearCurrentReport
} = reportSlice.actions

export default reportSlice.reducer