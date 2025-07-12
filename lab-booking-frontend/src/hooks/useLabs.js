import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { labService } from '../services/labService'

export const useLabs = (params = {}) => {
  return useQuery({
    queryKey: ['labs', params],
    queryFn: () => labService.getLabs(params),
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
