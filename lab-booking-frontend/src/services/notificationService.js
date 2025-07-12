import api from './api'

export const notificationService = {
  // Get notifications
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params })
    return response.data
  },

  getNotificationById: async (id) => {
    const response = await api.get(`/notifications/${id}`)
    return response.data
  },

  // Mark notifications as read
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`)
    return response.data
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/mark-all-read')
    return response.data
  },

  // Delete notifications
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`)
    return response.data
  },

  deleteAllNotifications: async () => {
    const response = await api.delete('/notifications/all')
    return response.data
  },

  // Notification preferences
  getNotificationSettings: async () => {
    const response = await api.get('/notifications/settings')
    return response.data
  },

  updateNotificationSettings: async (settings) => {
    const response = await api.put('/notifications/settings', settings)
    return response.data
  },

  // Send notifications (admin)
  sendNotification: async (notificationData) => {
    const response = await api.post('/notifications/send', notificationData)
    return response.data
  },

  sendBulkNotification: async (notificationData) => {
    const response = await api.post('/notifications/send-bulk', notificationData)
    return response.data
  },

  // Notification templates
  getNotificationTemplates: async () => {
    const response = await api.get('/notifications/templates')
    return response.data
  },

  createNotificationTemplate: async (templateData) => {
    const response = await api.post('/notifications/templates', templateData)
    return response.data
  },

  updateNotificationTemplate: async (id, templateData) => {
    const response = await api.put(`/notifications/templates/${id}`, templateData)
    return response.data
  },

  deleteNotificationTemplate: async (id) => {
    const response = await api.delete(`/notifications/templates/${id}`)
    return response.data
  }
}
