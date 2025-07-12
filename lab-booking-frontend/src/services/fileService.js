import api from './api'

export const fileService = {
  // Profile image upload
  uploadProfileImage: async (formData) => {
    const response = await api.post('/files/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  removeProfileImage: async () => {
    const response = await api.delete('/files/profile-image')
    return response.data
  },

  // General file upload
  uploadFile: async (file, type = 'general') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Multiple file upload
  uploadMultipleFiles: async (files, type = 'general') => {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })
    formData.append('type', type)
    
    const response = await api.post('/files/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // File download
  downloadFile: async (fileId) => {
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    })
    return response.data
  },

  // File deletion
  deleteFile: async (fileId) => {
    const response = await api.delete(`/files/${fileId}`)
    return response.data
  },

  // Get file info
  getFileInfo: async (fileId) => {
    const response = await api.get(`/files/${fileId}`)
    return response.data
  },

  // Get user files
  getUserFiles: async (params = {}) => {
    const response = await api.get('/files/user', { params })
    return response.data
  },

  // File validation
  validateFile: (file, options = {}) => {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
      minSize = 0
    } = options

    const errors = []

    if (file.size > maxSize) {
      errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`)
    }

    if (file.size < minSize) {
      errors.push(`File size must be at least ${minSize / (1024 * 1024)}MB`)
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
