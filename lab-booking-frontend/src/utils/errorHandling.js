import { toast } from 'react-toastify'

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
}

// Error handler class
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, statusCode = 500, details = null) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.statusCode = statusCode
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

// Error parser for API responses
export const parseApiError = (error) => {
  if (!error.response) {
    return new AppError(
      'Network error. Please check your connection.',
      ERROR_TYPES.NETWORK,
      0
    )
  }

  const { status, data } = error.response
  const message = data?.message || data?.error || 'An unexpected error occurred'
  const details = data?.details || null

  switch (status) {
    case 400:
      return new AppError(message, ERROR_TYPES.VALIDATION, status, details)
    case 401:
      return new AppError(message, ERROR_TYPES.AUTHENTICATION, status, details)
    case 403:
      return new AppError(message, ERROR_TYPES.AUTHORIZATION, status, details)
    case 404:
      return new AppError(message, ERROR_TYPES.NOT_FOUND, status, details)
    case 422:
      return new AppError(message, ERROR_TYPES.VALIDATION, status, details)
    case 500:
    case 502:
    case 503:
    case 504:
      return new AppError(
        'Server error. Please try again later.',
        ERROR_TYPES.SERVER,
        status,
        details
      )
    default:
      return new AppError(message, ERROR_TYPES.UNKNOWN, status, details)
  }
}

// Global error handler
export const handleError = (error, showToast = true) => {
  let appError

  if (error instanceof AppError) {
    appError = error
  } else if (error.response) {
    appError = parseApiError(error)
  } else {
    appError = new AppError(
      error.message || 'An unexpected error occurred',
      ERROR_TYPES.UNKNOWN
    )
  }

  // Log error for debugging
  console.error('Application Error:', {
    message: appError.message,
    type: appError.type,
    statusCode: appError.statusCode,
    details: appError.details,
    timestamp: appError.timestamp,
    stack: appError.stack
  })

  // Show toast notification
  if (showToast) {
    const toastType = getToastType(appError.type)
    toast[toastType](appError.message)
  }

  // Handle specific error types
  switch (appError.type) {
    case ERROR_TYPES.AUTHENTICATION:
      // Redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
      break
    case ERROR_TYPES.AUTHORIZATION:
      // Redirect to unauthorized page
      window.location.href = '/unauthorized'
      break
    default:
      // Handle other errors as needed
      break
  }

  return appError
}

// Get toast type based on error type
const getToastType = (errorType) => {
  switch (errorType) {
    case ERROR_TYPES.VALIDATION:
      return 'warning'
    case ERROR_TYPES.AUTHENTICATION:
    case ERROR_TYPES.AUTHORIZATION:
      return 'error'
    case ERROR_TYPES.NETWORK:
    case ERROR_TYPES.SERVER:
      return 'error'
    default:
      return 'error'
  }
}

// Validation error formatter
export const formatValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    return errors.map(error => error.message || error).join(', ')
  }
  
  if (typeof errors === 'object') {
    return Object.values(errors).flat().join(', ')
  }
  
  return errors.toString()
}

// Retry mechanism for failed requests
export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry for certain error types
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw error
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }

  throw lastError
}

// Error boundary helper
export const createErrorBoundary = (fallbackComponent) => {
  return class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props)
      this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
      console.error('Error Boundary caught an error:', error, errorInfo)
      
      // Log to error reporting service
      // logErrorToService(error, errorInfo)
    }

    render() {
      if (this.state.hasError) {
        return fallbackComponent ? 
          React.createElement(fallbackComponent, { error: this.state.error }) :
          React.createElement('div', { className: 'error-fallback' }, 'Something went wrong.')
      }

      return this.props.children
    }
  }
}
