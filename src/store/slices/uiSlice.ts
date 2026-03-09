// src/store/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  isLoading: boolean
  modalState: Record<string, boolean>
  toastMessages: ToastMessage[]
  breadcrumbs: Breadcrumb[]
  currentPageTitle: string
}

interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

interface Breadcrumb {
  label: string
  path?: string
}

// Check if we're on desktop on initial load
const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1024 : true

const initialState: UIState = {
  sidebarOpen: isDesktop, // On desktop, sidebar starts open
  theme: 'system',
  isLoading: false,
  modalState: {},
  toastMessages: [],
  breadcrumbs: [],
  currentPageTitle: '',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.modalState[action.payload] = true
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modalState[action.payload] = false
    },
    addToast: (state, action: PayloadAction<Omit<ToastMessage, 'id'>>) => {
      const id = Date.now().toString()
      state.toastMessages.push({ ...action.payload, id })
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toastMessages = state.toastMessages.filter(t => t.id !== action.payload)
    },
    clearToasts: (state) => {
      state.toastMessages = []
    },
    setBreadcrumbs: (state, action: PayloadAction<Breadcrumb[]>) => {
      state.breadcrumbs = action.payload
    },
    setCurrentPageTitle: (state, action: PayloadAction<string>) => {
      state.currentPageTitle = action.payload
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setGlobalLoading,
  openModal,
  closeModal,
  addToast,
  removeToast,
  clearToasts,
  setBreadcrumbs,
  setCurrentPageTitle,
} = uiSlice.actions

export default uiSlice.reducer