import api from './api'

export const labService = {
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
}
