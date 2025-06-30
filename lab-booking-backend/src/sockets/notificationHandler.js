export default function notificationHandler(socket, io) {
  // Join user to their notification room
  socket.join(`user_${socket.user.id}`);
  
  // Handle notification acknowledgment
  socket.on('notificationRead', async (notificationId) => {
    try {
      // Update notification as read in database
      // This would typically call your notification service
      console.log(`User ${socket.user.id} read notification ${notificationId}`);
      
      // Emit confirmation back to user
      socket.emit('notificationReadConfirmed', { notificationId });
    } catch (error) {
      socket.emit('error', { message: 'Failed to mark notification as read' });
    }
  });

  // Handle notification settings update
  socket.on('updateNotificationSettings', async (settings) => {
    try {
      // Update user notification preferences
      console.log(`User ${socket.user.id} updated notification settings:`, settings);
      
      socket.emit('notificationSettingsUpdated', { settings });
    } catch (error) {
      socket.emit('error', { message: 'Failed to update notification settings' });
    }
  });

  // Send real-time notification to user
  const sendNotificationToUser = (userId, notification) => {
    io.to(`user_${userId}`).emit('newNotification', notification);
  };

  // Broadcast notification to role
  const sendNotificationToRole = (role, notification) => {
    io.to(`role_${role}`).emit('newNotification', notification);
  };

  // Make functions available to other parts of the application
  socket.sendNotificationToUser = sendNotificationToUser;
  socket.sendNotificationToRole = sendNotificationToRole;
}
