import React, { useState } from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import { useToast } from '../../hooks/useToast'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import LoadingSpinner from '../common/LoadingSpinner'
import EmptyState from '../common/EmptyState'
import NotificationItem from './NotificationItem'
import { NOTIFICATION_TYPES } from '../../utils/constants'
import { formatRelativeTime } from '../../utils/dateUtils'

const NotificationCenter = () => {
  const { showToast } = useToast()
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    read: ''
  })

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications()

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      read: ''
    })
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead()
      showToast('All notifications marked as read', 'success')
    } catch (error) {
      showToast('Failed to mark notifications as read', 'error')
    }
  }

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId)
      showToast('Notification deleted', 'success')
    } catch (error) {
      showToast('Failed to delete notification', 'error')
    }
  }

  const filteredNotifications = notifications?.filter(notification => {
    const matchesSearch = !filters.search || 
      notification.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      notification.message.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesType = !filters.type || notification.type === filters.type
    
    const matchesRead = filters.read === '' || 
      (filters.read === 'read' && notification.read) ||
      (filters.read === 'unread' && !notification.read)
    
    return matchesSearch && matchesType && matchesRead
  }) || []

  if (isLoading) {
    return (
      <Card className="p-6">
        <LoadingSpinner message="Loading notifications..." />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your notifications and alerts
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={handleMarkAllRead}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Mark All as Read
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Search notifications..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <div>
            <Select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              placeholder="All Types"
            >
              <option value="">All Types</option>
              {Object.entries(NOTIFICATION_TYPES).map(([key, value]) => (
                <option key={key} value={value}>
                  {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Select
              value={filters.read}
              onChange={(e) => handleFilterChange('read', e.target.value)}
              placeholder="All Status"
            >
              <option value="">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
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

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={() => markAsRead(notification.id)}
              onDelete={() => handleDeleteNotification(notification.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a9.5 9.5 0 0119 0v10z" />
            </svg>
          }
          title="No notifications found"
          description={
            Object.values(filters).some(f => f) 
              ? 'Try adjusting your filters to see more results.'
              : 'You have no notifications at the moment.'
          }
          action={Object.values(filters).some(f => f) ? clearFilters : undefined}
          actionText={Object.values(filters).some(f => f) ? "Clear Filters" : undefined}
        />
      )}
    </div>
  )
}

export default NotificationCenter
