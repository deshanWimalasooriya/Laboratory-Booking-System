import api from './api'

export const bookingService = {
  getBookings: async (params = {}) => {
    const response = await api.get('/bookings', { params })
    return response.data
  },

  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`)
    return response.data
  },

  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData)
    return response.data
  },

  updateBooking: async (id, bookingData) => {
    const response = await api.put(`/bookings/${id}`, bookingData)
    return response.data
  },

  deleteBooking: async (id) => {
    const response = await api.delete(`/bookings/${id}`)
    return response.data
  },

  getAvailableSlots: async (labId, date) => {
    const response = await api.get(`/bookings/available-slots`, {
      params: { labId, date }
    })
    return response.data
  },
}
