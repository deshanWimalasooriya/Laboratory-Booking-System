import api from './api'

export const labService = {
  // Basic CRUD operations
  getLabs: async (params = {}) => {
    const response = await api.get('/labs', { params })
    return response.data
  },

  getLabById: async (id) => {
    const response = await api.get(`/labs/${id}`)
    return response.data
  },

  createLab: async (labData) => {
    const response = await api.post('/labs', labData)
    return response.data
  },

  updateLab: async (id, labData) => {
    const response = await api.put(`/labs/${id}`, labData)
    return response.data
  },

  deleteLab: async (id) => {
    const response = await api.delete(`/labs/${id}`)
    return response.data
  },

  // Lab availability
  getLabAvailability: async (labId, date) => {
    const response = await api.get(`/labs/${labId}/availability`, {
      params: { date }
    })
    return response.data
  },

  getAvailableSlots: async (labId, date) => {
    const response = await api.get(`/labs/${labId}/available-slots`, {
      params: { date }
    })
    return response.data
  },

  // Lab statistics
  getLabStats: async (labId) => {
    const response = await api.get(`/labs/${labId}/stats`)
    return response.data
  },

  getLabUsage: async (labId, params = {}) => {
    const response = await api.get(`/labs/${labId}/usage`, { params })
    return response.data
  },

  // Lab equipment
  getLabEquipment: async (labId) => {
    const response = await api.get(`/labs/${labId}/equipment`)
    return response.data
  },

  addEquipmentToLab: async (labId, equipmentId) => {
    const response = await api.post(`/labs/${labId}/equipment`, { equipmentId })
    return response.data
  },

  removeEquipmentFromLab: async (labId, equipmentId) => {
    const response = await api.delete(`/labs/${labId}/equipment/${equipmentId}`)
    return response.data
  },

  // Lab status management
  updateLabStatus: async (labId, status) => {
    const response = await api.put(`/labs/${labId}/status`, { status })
    return response.data
  },

  // Lab bookings
  getLabBookings: async (labId, params = {}) => {
    const response = await api.get(`/labs/${labId}/bookings`, { params })
    return response.data
  },

  // Lab schedule
  getLabSchedule: async (labId, params = {}) => {
    const response = await api.get(`/labs/${labId}/schedule`, { params })
    return response.data
  },

  // Bulk operations
  bulkUpdateLabs: async (labIds, updateData) => {
    const response = await api.put('/labs/bulk', { labIds, updateData })
    return response.data
  },

  // Export/Import
  exportLabs: async (params = {}) => {
    const response = await api.get('/labs/export', { 
      params,
      responseType: 'blob'
    })
    return response.data
  },

  importLabs: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/labs/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}
