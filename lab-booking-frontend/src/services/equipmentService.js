import api from './api'

export const equipmentService = {
  // Basic CRUD operations
  getEquipment: async (params = {}) => {
    const response = await api.get('/equipment', { params })
    return response.data
  },

  getEquipmentById: async (id) => {
    const response = await api.get(`/equipment/${id}`)
    return response.data
  },

  createEquipment: async (equipmentData) => {
    const response = await api.post('/equipment', equipmentData)
    return response.data
  },

  updateEquipment: async (id, equipmentData) => {
    const response = await api.put(`/equipment/${id}`, equipmentData)
    return response.data
  },

  deleteEquipment: async (id) => {
    const response = await api.delete(`/equipment/${id}`)
    return response.data
  },

  // Equipment status management
  updateEquipmentStatus: async (id, status) => {
    const response = await api.put(`/equipment/${id}/status`, { status })
    return response.data
  },

  getEquipmentStatus: async (id) => {
    const response = await api.get(`/equipment/${id}/status`)
    return response.data
  },

  // Maintenance management
  getMaintenanceLogs: async (id) => {
    const response = await api.get(`/equipment/${id}/maintenance`)
    return response.data
  },

  addMaintenanceLog: async (id, maintenanceData) => {
    const response = await api.post(`/equipment/${id}/maintenance`, maintenanceData)
    return response.data
  },

  scheduleMaintenanceLog: async (id, maintenanceData) => {
    const response = await api.post(`/equipment/${id}/maintenance/schedule`, maintenanceData)
    return response.data
  },

  completeMaintenanceLog: async (id, logId, completionData) => {
    const response = await api.put(`/equipment/${id}/maintenance/${logId}/complete`, completionData)
    return response.data
  },

  // Equipment availability
  getEquipmentAvailability: async (id, params = {}) => {
    const response = await api.get(`/equipment/${id}/availability`, { params })
    return response.data
  },

  reserveEquipment: async (id, reservationData) => {
    const response = await api.post(`/equipment/${id}/reserve`, reservationData)
    return response.data
  },

  releaseEquipment: async (id) => {
    const response = await api.post(`/equipment/${id}/release`)
    return response.data
  },

  // Equipment usage tracking
  getEquipmentUsage: async (id, params = {}) => {
    const response = await api.get(`/equipment/${id}/usage`, { params })
    return response.data
  },

  logEquipmentUsage: async (id, usageData) => {
    const response = await api.post(`/equipment/${id}/usage`, usageData)
    return response.data
  },

  // Equipment by laboratory
  getLabEquipment: async (labId) => {
    const response = await api.get(`/labs/${labId}/equipment`)
    return response.data
  },

  assignEquipmentToLab: async (equipmentId, labId) => {
    const response = await api.put(`/equipment/${equipmentId}/assign`, { labId })
    return response.data
  },

  unassignEquipmentFromLab: async (equipmentId) => {
    const response = await api.put(`/equipment/${equipmentId}/unassign`)
    return response.data
  },

  // Bulk operations
  bulkUpdateEquipment: async (equipmentIds, updateData) => {
    const response = await api.put('/equipment/bulk', { equipmentIds, updateData })
    return response.data
  },

  bulkDeleteEquipment: async (equipmentIds) => {
    const response = await api.delete('/equipment/bulk', { data: { equipmentIds } })
    return response.data
  },

  // Import/Export
  exportEquipment: async (params = {}) => {
    const response = await api.get('/equipment/export', { 
      params,
      responseType: 'blob'
    })
    return response.data
  },

  importEquipment: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/equipment/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Equipment statistics
  getEquipmentStats: async (params = {}) => {
    const response = await api.get('/equipment/stats', { params })
    return response.data
  },

  getEquipmentUtilization: async (params = {}) => {
    const response = await api.get('/equipment/utilization', { params })
    return response.data
  }
}
