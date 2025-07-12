import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingService } from '../services/bookingService'

export const useBookings = (params = {}) => {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => bookingService.getBookings(params),
  })
}

export const useBooking = (id) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.getBookingById(id),
    enabled: !!id,
  })
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export const useUpdateBooking = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => bookingService.updateBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export const useDeleteBooking = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: bookingService.deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}
