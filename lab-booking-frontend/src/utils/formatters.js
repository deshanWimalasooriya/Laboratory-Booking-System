// Utility functions for formatting data

// Number formatters
export const formatNumber = (num, options = {}) => {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    locale = 'en-US'
  } = options

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits
  }).format(num)
}

export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount)
}

export const formatPercentage = (value, decimals = 1) => {
  return `${(value * 100).toFixed(decimals)}%`
}

export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// String formatters
export const formatName = (firstName, lastName) => {
  if (!firstName && !lastName) return ''
  if (!lastName) return firstName
  if (!firstName) return lastName
  return `${firstName} ${lastName}`
}

export const formatInitials = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return ''
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '')
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  // Return original if not a standard format
  return phoneNumber
}

export const formatEmail = (email) => {
  if (!email) return ''
  return email.toLowerCase().trim()
}

export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + suffix
}

export const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const capitalizeWords = (str) => {
  if (!str) return ''
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '')             // Trim - from end of text
}

// Date and time formatters (extending dateUtils)
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours} hr`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

export const formatTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return ''
  return `${startTime} - ${endTime}`
}

// Status formatters
export const formatStatus = (status) => {
  if (!status) return ''
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export const formatRole = (role) => {
  if (!role) return ''
  return role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

// Array formatters
export const formatList = (items, conjunction = 'and') => {
  if (!items || items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`
  
  const lastItem = items[items.length - 1]
  const otherItems = items.slice(0, -1)
  
  return `${otherItems.join(', ')}, ${conjunction} ${lastItem}`
}

export const formatTags = (tags, maxVisible = 3) => {
  if (!tags || tags.length === 0) return []
  
  const visible = tags.slice(0, maxVisible)
  const remaining = tags.length - maxVisible
  
  if (remaining > 0) {
    return [...visible, `+${remaining} more`]
  }
  
  return visible
}

// Object formatters
export const formatAddress = (address) => {
  if (!address) return ''
  
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country
  ].filter(Boolean)
  
  return parts.join(', ')
}

// Validation formatters
export const formatValidationError = (error) => {
  if (typeof error === 'string') return error
  if (error.message) return error.message
  if (Array.isArray(error)) return error.join(', ')
  return 'Invalid input'
}

// Search formatters
export const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm) return text
  
  const regex = new RegExp(`(${searchTerm})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// URL formatters
export const formatUrl = (url) => {
  if (!url) return ''
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

export const extractDomain = (url) => {
  try {
    return new URL(formatUrl(url)).hostname
  } catch {
    return url
  }
}

// Color formatters
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

// Export all formatters as a single object
export const formatters = {
  number: formatNumber,
  currency: formatCurrency,
  percentage: formatPercentage,
  fileSize: formatFileSize,
  name: formatName,
  initials: formatInitials,
  phoneNumber: formatPhoneNumber,
  email: formatEmail,
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  slugify,
  duration: formatDuration,
  timeRange: formatTimeRange,
  status: formatStatus,
  role: formatRole,
  list: formatList,
  tags: formatTags,
  address: formatAddress,
  validationError: formatValidationError,
  highlightSearchTerm,
  url: formatUrl,
  extractDomain,
  hexToRgb,
  rgbToHex
}
