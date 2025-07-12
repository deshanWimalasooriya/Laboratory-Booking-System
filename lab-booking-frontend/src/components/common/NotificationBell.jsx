import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import Dropdown from './Dropdown'
import Badge from './Badge'

const NotificationBell = ({ count = 0 }) => {
  const navigate = useNavigate()
  const { notifications, markAsRead, markAllAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const recentNotifications = notifications.slice(0, 5)

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'booking_approved':
      case 'booking_rejected':
        navigate(`/bookings/${notification.data?.bookingId}`)
        break
      case 'equipment_maintenance':
        navigate(`/equipment/${notification.data?.equipmentId}`)
        break
      default:
        navigate('/notifications')
    }
    
    setIsOpen(false)
  }

  const notificationItems = [
    ...recentNotifications.map(notification => ({
      id: notification.id,
      content: (
        <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 cursor-pointer">
          <div className={`
            flex-shrink-0 w-2 h-2 mt-2 rounded-full
            ${notification.read ? 'bg-gray-300' : 'bg-blue-500'}
          `} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
              {notification.title}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {notification.message}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(notification.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ),
      onClick: () => handleNotificationClick(notification)
    })),
    ...(recentNotifications.length > 0 ? [
      { type: 'divider' },
      {
        content: (
          <div className="p-3 text-center">
            <button
              onClick={() => {
                markAllAsRead()
                setIsOpen(false)
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all as read
            </button>
          </div>
        )
      },
      {
        content: (
          <div className="p-3 text-center border-t border-gray-200">
            <button
              onClick={() => {
                navigate('/notifications')
                setIsOpen(false)
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all notifications
            </button>
          </div>
        )
      }
    ] : [
      {
        content: (
          <div className="p-6 text-center">
            <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a9.5 9.5 0 0119 0v10z" />
            </svg>
            <p className="text-sm text-gray-500">No notifications</p>
          </div>
        )
      }
    ])
  ]

  return (
    <Dropdown
      trigger={
        <button className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a9.5 9.5 0 0119 0v10z" />
          </svg>
          {count > 0 && (
            <Badge
              count={count}
              className="absolute -top-1 -right-1"
            />
          )}
        </button>
      }
      items={notificationItems}
      align="right"
      width="w-80"
      isOpen={isOpen}
      onToggle={setIsOpen}
    />
  )
}

export default NotificationBell
