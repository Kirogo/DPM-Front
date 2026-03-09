export const APP_CONFIG = {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    SIGNALR_URL: import.meta.env.VITE_SIGNALR_URL || 'http://localhost:5000/hubs',
    STORAGE_KEY: 'geobuild_token',
    MAP_ACCESS_TOKEN: import.meta.env.VITE_MAP_TOKEN,
    APP_NAME: 'GeoBuild',
    VERSION: '1.0.0',
}
