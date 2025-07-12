import React, { useState, useRef } from 'react'
import { useToast } from '../../hooks/useToast'
import { fileService } from '../../services/fileService'
import Button from '../ui/Button'
import Avatar from '../common/Avatar'
import LoadingSpinner from '../common/LoadingSpinner'

const ProfileImageUpload = ({ currentImage, onImageUpdate, onClose }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState(currentImage)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      showToast('Please select a valid image file (JPEG, PNG, or GIF)', 'error')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      showToast('File size must be less than 5MB', 'error')
      return
    }

    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast('Please select an image first', 'error')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      
      const response = await fileService.uploadProfileImage(formData)
      onImageUpdate(response.imageUrl)
    } catch (error) {
      showToast(error.message || 'Failed to upload image', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveImage = async () => {
    setIsLoading(true)
    try {
      await fileService.removeProfileImage()
      onImageUpdate(null)
    } catch (error) {
      showToast(error.message || 'Failed to remove image', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Avatar
          src={preview}
          alt="Profile preview"
          size="2xl"
          className="mx-auto mb-4"
        />
        
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={isLoading}
          >
            Choose Image
          </Button>
          
          {selectedFile && (
            <div className="text-sm text-gray-600">
              Selected: {selectedFile.name}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Image Requirements:
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Supported formats: JPEG, PNG, GIF</li>
          <li>• Maximum file size: 5MB</li>
          <li>• Recommended size: 400x400 pixels</li>
          <li>• Square images work best</li>
        </ul>
      </div>

      <div className="flex justify-between">
        <div>
          {currentImage && (
            <Button
              onClick={handleRemoveImage}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
              disabled={isLoading}
            >
              Remove Image
            </Button>
          )}
        </div>
        
        <div className="flex space-x-3">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isLoading || !selectedFile}
            className="min-w-[100px]"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Upload'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProfileImageUpload
