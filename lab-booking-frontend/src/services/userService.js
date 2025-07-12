import api from './api'

export const userService = {
  // Profile management
  getProfile: async () => {
    const response = await api.get('/users/profile')
    return response.data
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData)
    return response.data
  },

  updateProfileImage: async (imageUrl) => {
    const response = await api.put('/users/profile/image', { imageUrl })
    return response.data
  },

  // User management (admin)
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params })
    return response.data
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  createUser: async (userData) => {
    const response = await api.post('/users', userData)
    return response.data
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  // User status management
  activateUser: async (id) => {
    const response = await api.put(`/users/${id}/activate`)
    return response.data
  },

  deactivateUser: async (id) => {
    const response = await api.put(`/users/${id}/deactivate`)
    return response.data
  },

  // User statistics
  getUserStats: async (id) => {
    const response = await api.get(`/users/${id}/stats`)
    return response.data
  },

  // Bulk operations
  bulkUpdateUsers: async (userIds, updateData) => {
    const response = await api.put('/users/bulk', { userIds, updateData })
    return response.data
  },

  exportUsers: async (params = {}) => {
    const response = await api.get('/users/export', { 
      params,
      responseType: 'blob'
    })
    return response.data
  }
}
