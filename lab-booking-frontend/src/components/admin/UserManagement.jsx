import React, { useState } from 'react'
import { useUsers, useDeleteUser, useUpdateUser } from '../../hooks/useUsers'
import { useToast } from '../../hooks/useToast'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import LoadingSpinner from '../common/LoadingSpinner'
import EmptyState from '../common/EmptyState'
import ConfirmDialog from '../common/ConfirmDialog'
import UserTable from './UserTable'
import { USER_ROLES } from '../../utils/constants'

const UserManagement = () => {
  const { showToast } = useToast()
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  })
  const [selectedUser, setSelectedUser] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', user: null })

  const { data: users, isLoading, error } = useUsers(filters)
  const deleteUserMutation = useDeleteUser()
  const updateUserMutation = useUpdateUser()

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      role: '',
      status: ''
    })
  }

  const handleDeleteUser = (user) => {
    setConfirmDialog({
      open: true,
      type: 'delete',
      user,
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`
    })
  }

  const handleActivateUser = async (user) => {
    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        data: { status: 'active' }
      })
      showToast(`${user.name} has been activated`, 'success')
    } catch (error) {
      showToast(error.message || 'Failed to activate user', 'error')
    }
  }

  const handleDeactivateUser = async (user) => {
    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        data: { status: 'inactive' }
      })
      showToast(`${user.name} has been deactivated`, 'success')
    } catch (error) {
      showToast(error.message || 'Failed to deactivate user', 'error')
    }
  }

  const handleConfirmAction = async () => {
    const { type, user } = confirmDialog
    
    try {
      if (type === 'delete') {
        await deleteUserMutation.mutateAsync(user.id)
        showToast(`${user.name} has been deleted`, 'success')
      }
    } catch (error) {
      showToast(error.message || `Failed to ${type} user`, 'error')
    } finally {
      setConfirmDialog({ open: false, type: '', user: null })
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <LoadingSpinner message="Loading users..." />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Failed to load users"
          description={error.message}
          action={() => window.location.reload()}
          actionText="Try Again"
        />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage system users and their permissions
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={() => setSelectedUser({ isNew: true })}
            className="w-full sm:w-auto"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <div>
            <Select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              placeholder="All Roles"
            >
              <option value="">All Roles</option>
              {Object.entries(USER_ROLES).map(([key, value]) => (
                <option key={key} value={value}>
                  {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              placeholder="All Status"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </Select>
          </div>
          <div>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* User Table */}
      {users && users.length > 0 ? (
        <UserTable
          users={users}
          onEdit={setSelectedUser}
          onDelete={handleDeleteUser}
          onActivate={handleActivateUser}
          onDeactivate={handleDeactivateUser}
        />
      ) : (
        <EmptyState
          icon={
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          }
          title="No users found"
          description={
            Object.values(filters).some(f => f) 
              ? 'Try adjusting your filters to see more results.'
              : 'No users are currently in the system.'
          }
          action={
            Object.values(filters).some(f => f) 
              ? clearFilters 
              : () => setSelectedUser({ isNew: true })
          }
          actionText={
            Object.values(filters).some(f => f) 
              ? "Clear Filters" 
              : "Add First User"
          }
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, type: '', user: null })}
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
        severity="danger"
      />
    </div>
  )
}

export default UserManagement
