import { useQuery } from '@tanstack/react-query'
import { scheduleService } from '../services/scheduleService'

export const useSchedule = (params = {}) => {
  return useQuery({
    queryKey: ['schedule', params],
    queryFn: () => scheduleService.getSchedule(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export const useLabSchedule = (labId, params = {}) => {
  return useQuery({
    queryKey: ['lab-schedule', labId, params],
    queryFn: () => scheduleService.getLabSchedule(labId, params),
    enabled: !!labId,
    staleTime: 2 * 60 * 1000,
  })
}

export const useUserSchedule = (userId, params = {}) => {
  return useQuery({
    queryKey: ['user-schedule', userId, params],
    queryFn: () => scheduleService.getUserSchedule(userId, params),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

export const useScheduleConflicts = (bookingData) => {
  return useQuery({
    queryKey: ['schedule-conflicts', bookingData],
    queryFn: () => scheduleService.checkConflicts(bookingData),
    enabled: !!(bookingData?.labId && bookingData?.date && bookingData?.timeSlot),
    staleTime: 30 * 1000, // 30 seconds
  })
}
