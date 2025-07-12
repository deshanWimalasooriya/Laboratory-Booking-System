import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { equipmentService } from '../services/equipmentService'

export const useEquipment = (params = {}) => {
  return useQuery({
    queryKey: ['equipment', params],
    queryFn: () => equipmentService.getEquipment(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useEquipmentItem = (id) => {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: () => equipmentService.getEquipmentById(id),
    enabled: !!id,
  })
}

export const useCreateEquipment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: equipmentService.createEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
    },
  })
}

export const useUpdateEquipment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => equipmentService.updateEquipment(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      queryClient.invalidateQueries({ queryKey: ['equipment', variables.id] })
    },
  })
}

export const useDeleteEquipment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: equipmentService.deleteEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
    },
  })
}

export const useEquipmentMaintenance = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, maintenanceData }) => 
      equipmentService.scheduleMaintenanceLog(id, maintenanceData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      queryClient.invalidateQueries({ queryKey: ['equipment', variables.id] })
    },
  })
}

export const useEquipmentStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status }) => equipmentService.updateEquipmentStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      queryClient.invalidateQueries({ queryKey: ['equipment', variables.id] })
    },
  })
}
