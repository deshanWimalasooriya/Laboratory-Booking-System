import { useState, useEffect, useContext, createContext } from 'react'
import { notificationService } from '../services/notificationService'
import { useAuth } from './useAuth'
import { useSocket } from './useSocket'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { socket } = useSocket()

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const data = await notificationService.getNotifications()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId)
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      )
      // Update unread count if deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId)
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  // Socket listeners for real-time notifications
  useEffect(() => {
    if (!socket || !user) return

    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
    }

    socket.on('notification:new', handleNewNotification)

    return () => {
      socket.off('notification:new', handleNewNotification)
    }
  }, [socket, user])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [user])

  const value = {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
