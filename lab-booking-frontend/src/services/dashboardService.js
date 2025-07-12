import api from './api'

export const dashboardService = {
  // Dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },

  getUserActivity: async (params = {}) => {
    const response = await api.get('/dashboard/activity', { params })
    return response.data
  },

  getSystemHealth: async () => {
    const response = await api.get('/dashboard/health')
    return response.data
  },

  // Recent activities
  getRecentActivities: async (params = {}) => {
    const response = await api.get('/dashboard/recent-activities', { params })
    return response.data
  },

  // Analytics data
  getBookingTrends: async (params = {}) => {
    const response = await api.get('/dashboard/booking-trends', { params })
    return response.data
  },

  getLabUtilization: async (params = {}) => {
    const response = await api.get('/dashboard/lab-utilization', { params })
    return response.data
  },

  getEquipmentUsage: async (params = {}) => {
    const response = await api.get('/dashboard/equipment-usage', { params })
    return response.data
  },

  // Notifications and alerts
  getSystemAlerts: async () => {
    const response = await api.get('/dashboard/alerts')
    return response.data
  },

  dismissAlert: async (alertId) => {
    const response = await api.put(`/dashboard/alerts/${alertId}/dismiss`)
    return response.data
  }
}
