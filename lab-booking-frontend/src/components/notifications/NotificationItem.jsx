import React from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { formatRelativeTime } from '../../utils/dateUtils'
import { NOTIFICATION_TYPES } from '../../utils/constants'

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const navigate = useNavigate()

  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.BOOKING_APPROVED:
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case NOTIFICATION_TYPES.BOOKING_REJECTED:
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case NOTIFICATION_TYPES.BOOKING_REMINDER:
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case NOTIFICATION_TYPES.EQUIPMENT_MAINTENANCE:
        return (
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead()
    }
    
    // Navigate based on notification type
    if (notification.data?.bookingId) {
      navigate(`/bookings/${notification.data.bookingId}`)
    } else if (notification.data?.equipmentId) {
      navigate(`/equipment/${notification.data.equipmentId}`)
    } else if (notification.data?.labId) {
      navigate(`/labs/${notification.data.labId}`)
    }
  }

  return (
    <Card 
      className={`
        p-4 cursor-pointer transition-all hover:shadow-md
        ${notification.read ? 'bg-white' : 'bg-blue-50 border-blue-200'}
      `}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* Status indicator */}
        <div className="flex-shrink-0 mt-1">
          {!notification.read && (
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          )}
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`
                text-sm font-medium
                ${notification.read ? 'text-gray-900' : 'text-gray-900 font-semibold'}
              `}>
                {notification.title}
              </h3>
              <p className={`
                text-sm mt-1
                ${notification.read ? 'text-gray-600' : 'text-gray-700'}
              `}>
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {formatRelativeTime(notification.createdAt)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              {!notification.read && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkAsRead()
                  }}
                >
                  Mark as Read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="text-red-600 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default NotificationItem
