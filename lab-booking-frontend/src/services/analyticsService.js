import api from './api'

export const analyticsService = {
  // General analytics
  getAnalytics: async (params = {}) => {
    const response = await api.get('/analytics', { params })
    return response.data
  },

  // Booking analytics
  getBookingAnalytics: async (params = {}) => {
    const response = await api.get('/analytics/bookings', { params })
    return response.data
  },

  getBookingTrends: async (params = {}) => {
    const response = await api.get('/analytics/bookings/trends', { params })
    return response.data
  },

  getBookingsByStatus: async (params = {}) => {
    const response = await api.get('/analytics/bookings/status', { params })
    return response.data
  },

  // Lab analytics
  getLabAnalytics: async (params = {}) => {
    const response = await api.get('/analytics/labs', { params })
    return response.data
  },

  getLabUtilization: async (params = {}) => {
    const response = await api.get('/analytics/labs/utilization', { params })
    return response.data
  },

  getPopularLabs: async (params = {}) => {
    const response = await api.get('/analytics/labs/popular', { params })
    return response.data
  },

  // Equipment analytics
  getEquipmentAnalytics: async (params = {}) => {
    const response = await api.get('/analytics/equipment', { params })
    return response.data
  },

  getEquipmentUsage: async (params = {}) => {
    const response = await api.get('/analytics/equipment/usage', { params })
    return response.data
  },

  getMaintenanceStats: async (params = {}) => {
    const response = await api.get('/analytics/equipment/maintenance', { params })
    return response.data
  },

  // User analytics
  getUserAnalytics: async (params = {}) => {
    const response = await api.get('/analytics/users', { params })
    return response.data
  },

  getUserActivity: async (params = {}) => {
    const response = await api.get('/analytics/users/activity', { params })
    return response.data
  },

  getUsersByRole: async (params = {}) => {
    const response = await api.get('/analytics/users/roles', { params })
    return response.data
  },

  // Time-based analytics
  getPeakHours: async (params = {}) => {
    const response = await api.get('/analytics/peak-hours', { params })
    return response.data
  },

  getWeeklyTrends: async (params = {}) => {
    const response = await api.get('/analytics/weekly-trends', { params })
    return response.data
  },

  getMonthlyTrends: async (params = {}) => {
    const response = await api.get('/analytics/monthly-trends', { params })
    return response.data
  },

  // Export functions
  exportAnalytics: async (params = {}) => {
    const response = await api.get('/analytics/export', { 
      params,
      responseType: 'blob'
    })
    return response.data
  },

  generateReport: async (reportConfig) => {
    const response = await api.post('/analytics/reports', reportConfig, {
      responseType: 'blob'
    })
    return response.data
  },

  // Real-time analytics
  getRealTimeStats: async () => {
    const response = await api.get('/analytics/realtime')
    return response.data
  },

  // Custom analytics
  getCustomAnalytics: async (query) => {
    const response = await api.post('/analytics/custom', query)
    return response.data
  }
}
