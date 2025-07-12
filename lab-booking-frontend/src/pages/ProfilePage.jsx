import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useForm } from '../../hooks/useForm'
import { useToast } from '../../hooks/useToast'
import { userService } from '../../services/userService'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Avatar from '../../components/common/Avatar'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import PasswordChange from '../../components/profile/PasswordChange'
import ProfileImageUpload from '../../components/profile/ProfileImageUpload'
import { USER_ROLES } from '../../utils/constants'
import { formatDate } from '../../utils/dateUtils'

const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    setValues
  } = useForm({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      studentId: user?.studentId || '',
      bio: user?.bio || '',
    },
    validate: (values) => {
      const errors = {}
      
      if (!values.name.trim()) {
        errors.name = 'Name is required'
      } else if (values.name.length < 2) {
        errors.name = 'Name must be at least 2 characters'
      }
      
      if (!values.email.trim()) {
        errors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Email is invalid'
      }
      
      if (values.phone && !/^\+?[\d\s-()]+$/.test(values.phone)) {
        errors.phone = 'Phone number is invalid'
      }
      
      return errors
    }
  })

  React.useEffect(() => {
    if (user) {
      setValues({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        studentId: user.studentId || '',
        bio: user.bio || '',
      })
    }
  }, [user, setValues])

  const handleEditToggle = () => {
    if (isEditing) {
      resetForm()
    }
    setIsEditing(!isEditing)
  }

  const onSubmit = async (formData) => {
    setIsLoading(true)
    try {
      const updatedUser = await userService.updateProfile(formData)
      updateUser(updatedUser)
      setIsEditing(false)
      showToast('Profile updated successfully', 'success')
    } catch (error) {
      showToast(error.message || 'Failed to update profile', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpdate = async (imageUrl) => {
    try {
      const updatedUser = await userService.updateProfileImage(imageUrl)
      updateUser(updatedUser)
      setShowImageModal(false)
      showToast('Profile image updated successfully', 'success')
    } catch (error) {
      showToast(error.message || 'Failed to update profile image', 'error')
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'bg-red-100 text-red-800'
      case USER_ROLES.INSTRUCTOR:
        return 'bg-purple-100 text-purple-800'
      case USER_ROLES.TECHNICAL_OFFICER:
        return 'bg-blue-100 text-blue-800'
      case USER_ROLES.LECTURE_IN_CHARGE:
        return 'bg-green-100 text-green-800'
      case USER_ROLES.STUDENT:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar
                    src={user.profileImage}
                    alt={user.name}
                    size="xl"
                    className="mx-auto"
                  />
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>

                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  {user.name}
                </h2>
                
                <div className="mt-2 flex justify-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {user.role?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="mt-2 flex justify-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                    {user.status?.toUpperCase()}
                  </span>
                </div>

                <p className="mt-3 text-sm text-gray-600">
                  Member since {formatDate(user.createdAt, 'MMMM YYYY')}
                </p>

                {user.lastLoginAt && (
                  <p className="mt-1 text-sm text-gray-500">
                    Last login: {formatDate(user.lastLoginAt, 'MMM DD, YYYY HH:mm')}
                  </p>
                )}
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600">{user.email}</span>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-600">{user.phone}</span>
                    </div>
                  )}
                  
                  {user.department && (
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-gray-600">{user.department}</span>
                    </div>
                  )}
                  
                  {user.studentId && (
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      <span className="text-gray-600">ID: {user.studentId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  onClick={() => setShowPasswordModal(true)}
                  variant="outline"
                  className="w-full"
                >
                  Change Password
                </Button>
              </div>
            </Card>
          </div>

          {/* Profile Details Card */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Personal Information
                </h3>
                <Button
                  onClick={handleEditToggle}
                  variant={isEditing ? "outline" : "primary"}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      error={errors.name}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      error={errors.email}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      name="phone"
                      value={values.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      error={errors.phone}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <Input
                      name="department"
                      value={values.department}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter your department"
                    />
                  </div>

                  {user.role === USER_ROLES.STUDENT && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student ID
                      </label>
                      <Input
                        name="studentId"
                        value={values.studentId}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Enter your student ID"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={values.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleEditToggle}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="min-w-[100px]"
                    >
                      {isLoading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </form>
            </Card>

            {/* Account Statistics */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Account Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {user.stats?.totalBookings || 0}
                  </div>
                  <div className="text-sm text-blue-600">Total Bookings</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {user.stats?.activeBookings || 0}
                  </div>
                  <div className="text-sm text-green-600">Active Bookings</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {user.stats?.completedBookings || 0}
                  </div>
                  <div className="text-sm text-purple-600">Completed</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Modals */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Change Password"
          size="md"
        >
          <PasswordChange onClose={() => setShowPasswordModal(false)} />
        </Modal>

        <Modal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          title="Update Profile Image"
          size="md"
        >
          <ProfileImageUpload
            currentImage={user.profileImage}
            onImageUpdate={handleImageUpdate}
            onClose={() => setShowImageModal(false)}
          />
        </Modal>
      </div>
    </div>
  )
}

export default ProfilePage
