// src/config/api.config.ts
export const API_CONFIG = {
  // Your backend API URL - adjust this to match your backend
  BASE_URL: 'http://localhost:5000/api', // Make sure this matches your backend
  HUB_URL: 'http://localhost:5000/hub', // SignalR hub URL
}

// For debugging
console.log('API Base URL:', API_CONFIG.BASE_URL)