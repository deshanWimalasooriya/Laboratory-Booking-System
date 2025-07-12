import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { labService } from '../services/labService'

export const useLabs = (params = {}) => {
  return useQuery({
    queryKey: ['labs', params],
    queryFn: () => labService.getLabs(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useLab = (id) => {
  return useQuery({
    queryKey: ['lab', id],
    queryFn: () => labService.getLabById(id),
    enabled: !!id,
  })
}

export const useCreateLab = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: labService.createLab,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] })
    },
  })
}

export const useUpdateLab = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => labService.updateLab(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['labs'] })
      queryClient.invalidateQueries({ queryKey: ['lab', variables.id] })
    },
  })
}

export const useDeleteLab = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: labService.deleteLab,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] })
    },
  })
}

export const useLabAvailability = (labId, date) => {
  return useQuery({
    queryKey: ['lab-availability', labId, date],
    queryFn: () => labService.getLabAvailability(labId, date),
    enabled: !!labId && !!date,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useLabStats = (labId) => {
  return useQuery({
    queryKey: ['lab-stats', labId],
    queryFn: () => labService.getLabStats(labId),
    enabled: !!labId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
