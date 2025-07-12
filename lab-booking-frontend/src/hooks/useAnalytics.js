import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '../services/analyticsService'

export const useAnalytics = (params = {}) => {
  return useQuery({
    queryKey: ['analytics', params],
    queryFn: () => analyticsService.getAnalytics(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useBookingAnalytics = (params = {}) => {
  return useQuery({
    queryKey: ['booking-analytics', params],
    queryFn: () => analyticsService.getBookingAnalytics(params),
    staleTime: 10 * 60 * 1000,
  })
}

export const useLabAnalytics = (params = {}) => {
  return useQuery({
    queryKey: ['lab-analytics', params],
    queryFn: () => analyticsService.getLabAnalytics(params),
    staleTime: 10 * 60 * 1000,
  })
}

export const useUserAnalytics = (params = {}) => {
  return useQuery({
    queryKey: ['user-analytics', params],
    queryFn: () => analyticsService.getUserAnalytics(params),
    staleTime: 10 * 60 * 1000,
  })
}

export const useEquipmentAnalytics = (params = {}) => {
  return useQuery({
    queryKey: ['equipment-analytics', params],
    queryFn: () => analyticsService.getEquipmentAnalytics(params),
    staleTime: 10 * 60 * 1000,
  })
}
