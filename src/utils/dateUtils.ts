// src/utils/dateUtils.ts

/**
 * Parses a UTC date string and converts to Nairobi time (UTC+3)
 * Nairobi is UTC+3 year-round (no daylight savings)
 */
const parseAndConvertToNairobi = (dateString?: string | Date): Date | null => {
  if (!dateString) return null;
  
  try {
    // Parse the date - if it's a string, assume it's in UTC
    let date: Date;
    if (typeof dateString === 'string') {
      // If the string ends with Z, it's already UTC
      if (dateString.endsWith('Z')) {
        date = new Date(dateString);
      } else {
        // If no Z, append Z to treat as UTC
        date = new Date(dateString + 'Z');
      }
    } else {
      date = dateString;
    }
    
    if (isNaN(date.getTime())) return null;
    
    // Get UTC time components
    const utcYear = date.getUTCFullYear();
    const utcMonth = date.getUTCMonth();
    const utcDay = date.getUTCDate();
    const utcHours = date.getUTCHours();
    const utcMinutes = date.getUTCMinutes();
    const utcSeconds = date.getUTCSeconds();
    
    // Add 3 hours for Nairobi time
    const nairobiHours = utcHours + 3;
    
    // Create new date in Nairobi time (UTC+3)
    // We need to handle day/month overflow
    const nairobiDate = new Date(Date.UTC(
      utcYear,
      utcMonth,
      utcDay,
      nairobiHours,
      utcMinutes,
      utcSeconds
    ));
    
    return nairobiDate;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Formats a date string to Nairobi time (UTC+3) with numeric format
 * Used for tables and lists - format: DD/MM/YYYY
 */
export const formatNairobiDate = (dateString?: string | Date): string => {
  const nairobiDate = parseAndConvertToNairobi(dateString);
  if (!nairobiDate) return '—';
  
  // Format: DD/MM/YYYY (numeric only)
  const day = nairobiDate.getUTCDate().toString().padStart(2, '0');
  const month = (nairobiDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = nairobiDate.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Formats a date string to Nairobi time with date and time
 * Used for detail views - format: DD/MM/YYYY HH:MM
 */
export const formatNairobiDateTime = (dateString?: string | Date): string => {
  const nairobiDate = parseAndConvertToNairobi(dateString);
  if (!nairobiDate) return '—';
  
  // Format: DD/MM/YYYY HH:MM
  const day = nairobiDate.getUTCDate().toString().padStart(2, '0');
  const month = (nairobiDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = nairobiDate.getUTCFullYear();
  const hours = nairobiDate.getUTCHours().toString().padStart(2, '0');
  const minutes = nairobiDate.getUTCMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Formats a date string to a compact Nairobi time format (for comments/activity trails)
 * Format: DD/MM HH:MM
 */
export const formatCompactNairobiDateTime = (dateString?: string | Date): string => {
  const nairobiDate = parseAndConvertToNairobi(dateString);
  if (!nairobiDate) return '—';
  
  // Format: DD/MM HH:MM
  const day = nairobiDate.getUTCDate().toString().padStart(2, '0');
  const month = (nairobiDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const hours = nairobiDate.getUTCHours().toString().padStart(2, '0');
  const minutes = nairobiDate.getUTCMinutes().toString().padStart(2, '0');
  
  return `${day}/${month} ${hours}:${minutes}`;
};

/**
 * Format relative time (e.g., "2 hours ago") in Nairobi timezone
 */
export const formatRelativeNairobiTime = (dateString?: string | Date): string => {
  const nairobiDate = parseAndConvertToNairobi(dateString);
  if (!nairobiDate) return '—';
  
  const now = new Date();
  const nairobiNow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours() + 3,
    now.getUTCMinutes(),
    now.getUTCSeconds()
  ));
  
  const diffInSeconds = Math.floor((nairobiNow.getTime() - nairobiDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatCompactNairobiDateTime(dateString);
};