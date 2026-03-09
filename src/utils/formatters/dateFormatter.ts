import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

export const formatDate = (date: string | Date | number, formatStr = 'MMMM dd, yyyy') => {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
    return isValid(dateObj) ? format(dateObj, formatStr) : 'Invalid Date'
}

export const formatTime = (date: string | Date | number) => {
    return formatDate(date, 'HH:mm')
}

export const formatRelativeTime = (date: string | Date | number) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
    return isValid(dateObj) ? formatDistanceToNow(dateObj, { addSuffix: true }) : 'N/A'
}

export const formatISO = (date: Date = new Date()) => {
    return date.toISOString()
}

export const formatDateTime = (date: string | Date | number, formatStr = 'MMMM dd, yyyy HH:mm') => {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
    return isValid(dateObj) ? format(dateObj, formatStr) : 'Invalid Date'
}
