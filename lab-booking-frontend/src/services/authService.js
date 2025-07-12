import api from './api'

export const authService = {
  // Authentication
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error)
    }
  },

  // User profile
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData)
    return response.data
  },

  // Password management
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData)
    return response.data
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  resetPassword: async (resetData) => {
    const response = await api.post('/auth/reset-password', resetData)
    return response.data
  },

  // Email verification
  sendVerificationEmail: async () => {
    const response = await api.post('/auth/send-verification')
    return response.data
  },

  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token })
    return response.data
  },

  // Session management
  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token')
    return response.data
  },

  validateToken: async (token) => {
    const response = await api.post('/auth/validate-token', { token })
    return response.data
  },

  // Two-factor authentication
  enableTwoFactor: async () => {
    const response = await api.post('/auth/2fa/enable')
    return response.data
  },

  disableTwoFactor: async (code) => {
    const response = await api.post('/auth/2fa/disable', { code })
    return response.data
  },

  verifyTwoFactor: async (code) => {
    const response = await api.post('/auth/2fa/verify', { code })
    return response.data
  }
}
