// src/utils/dateUtils.ts

/**
 * Format date to Nairobi time in numeric format: DD/MM/YYYY HH:mm
 * Example: 15/03/2024 14:30
 */
export const formatNairobiDateTime = (dateString?: string | Date): string => {
  if (!dateString) return '—'
  
  try {
    const date = new Date(dateString)
    
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
    
    return new Intl.DateTimeFormat('en-KE', options).format(date)
  } catch {
    return '—'
  }
}

/**
 * Format date to Nairobi time in compact numeric format: DD/MM/YY HH:mm
 * Example: 15/03/24 14:30
 */
export const formatCompactNairobiDateTime = (dateString?: string | Date): string => {
  if (!dateString) return '—'
  
  try {
    const date = new Date(dateString)
    
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Africa/Nairobi',
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
    
    return new Intl.DateTimeFormat('en-KE', options).format(date)
  } catch {
    return '—'
  }
}

/**
 * Format date only (no time) in numeric format: DD/MM/YYYY
 * Example: 15/03/2024
 */
export const formatNairobiDate = (dateString?: string | Date): string => {
  if (!dateString) return '—'
  
  try {
    const date = new Date(dateString)
    
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }
    
    return new Intl.DateTimeFormat('en-KE', options).format(date)
  } catch {
    return '—'
  }
}

/**
 * Format time only in 24-hour format: HH:mm
 * Example: 14:30
 */
export const formatNairobiTime = (dateString?: string | Date): string => {
  if (!dateString) return '—'
  
  try {
    const date = new Date(dateString)
    
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Africa/Nairobi',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
    
    return new Intl.DateTimeFormat('en-KE', options).format(date)
  } catch {
    return '—'
  }
}