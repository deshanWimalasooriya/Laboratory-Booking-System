import api from './api'

export const equipmentService = {
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
}
