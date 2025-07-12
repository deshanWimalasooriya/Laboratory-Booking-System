import React, { useState } from 'react'
import { useForm } from '../../hooks/useForm'
import { useToast } from '../../hooks/useToast'
import { authService } from '../../services/authService'
import Button from '../ui/Button'
import Input from '../ui/Input'
import LoadingSpinner from '../common/LoadingSpinner'

const PasswordChange = ({ onClose }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    resetForm
  } = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validate: (values) => {
      const errors = {}
      
      if (!values.currentPassword) {
        errors.currentPassword = 'Current password is required'
      }
      
      if (!values.newPassword) {
        errors.newPassword = 'New password is required'
      } else if (values.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters'
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(values.newPassword)) {
        errors.newPassword = 'Password must contain uppercase, lowercase, and number'
      }
      
      if (!values.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password'
      } else if (values.newPassword !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }
      
      return errors
    }
  })

  const onSubmit = async (formData) => {
    setIsLoading(true)
    try {
      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })
      showToast('Password changed successfully', 'success')
      resetForm()
      onClose()
    } catch (error) {
      showToast(error.message || 'Failed to change password', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password *
          </label>
          <Input
            name="currentPassword"
            type="password"
            value={values.currentPassword}
            onChange={handleChange}
            error={errors.currentPassword}
            placeholder="Enter current password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password *
          </label>
          <Input
            name="newPassword"
            type="password"
            value={values.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            placeholder="Enter new password"
          />
          <p className="mt-1 text-xs text-gray-500">
            Must be at least 8 characters with uppercase, lowercase, and number
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password *
          </label>
          <Input
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Confirm new password"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Change Password'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default PasswordChange
