/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SIGNALR_URL: string
  readonly VITE_MAPS_API_KEY: string
  readonly VITE_ENABLE_GEOTAGGING: string
  readonly VITE_MAX_PHOTO_SIZE: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}