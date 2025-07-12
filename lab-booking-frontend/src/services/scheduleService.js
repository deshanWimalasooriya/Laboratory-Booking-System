import api from './api'

export const scheduleService = {
  // Get schedules
  getSchedule: async (params = {}) => {
    const response = await api.get('/schedule', { params })
    return response.data
  },

  getLabSchedule: async (labId, params = {}) => {
    const response = await api.get(`/schedule/lab/${labId}`, { params })
    return response.data
  },

  getUserSchedule: async (userId, params = {}) => {
    const response = await api.get(`/schedule/user/${userId}`, { params })
    return response.data
  },

  // Conflict checking
  checkConflicts: async (bookingData) => {
    const response = await api.post('/schedule/check-conflicts', bookingData)
    return response.data
  },

  getAvailableSlots: async (labId, date) => {
    const response = await api.get('/schedule/available-slots', {
      params: { labId, date }
    })
    return response.data
  },

  // Schedule management
  createScheduleBlock: async (scheduleData) => {
    const response = await api.post('/schedule/blocks', scheduleData)
    return response.data
  },

  updateScheduleBlock: async (blockId, scheduleData) => {
    const response = await api.put(`/schedule/blocks/${blockId}`, scheduleData)
    return response.data
  },

  deleteScheduleBlock: async (blockId) => {
    const response = await api.delete(`/schedule/blocks/${blockId}`)
    return response.data
  },

  // Recurring schedules
  createRecurringSchedule: async (scheduleData) => {
    const response = await api.post('/schedule/recurring', scheduleData)
    return response.data
  },

  updateRecurringSchedule: async (scheduleId, scheduleData) => {
    const response = await api.put(`/schedule/recurring/${scheduleId}`, scheduleData)
    return response.data
  },

  deleteRecurringSchedule: async (scheduleId) => {
    const response = await api.delete(`/schedule/recurring/${scheduleId}`)
    return response.data
  },

  // Schedule analytics
  getScheduleUtilization: async (params = {}) => {
    const response = await api.get('/schedule/utilization', { params })
    return response.data
  },

  getScheduleReport: async (params = {}) => {
    const response = await api.get('/schedule/report', { params })
    return response.data
  },

  // Export schedule
  exportSchedule: async (params = {}) => {
    const response = await api.get('/schedule/export', { 
      params,
      responseType: 'blob'
    })
    return response.data
  }
}
