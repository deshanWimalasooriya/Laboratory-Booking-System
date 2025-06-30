export default function bookingHandler(socket, io) {
  // Join booking-related rooms
  socket.on('joinBookingUpdates', () => {
    // Join room for booking updates based on user role
    if (['technical_officer', 'lecture_in_charge'].includes(socket.user.role)) {
      socket.join('booking_approvals');
    }
    
    // Join room for user's own bookings
    socket.join(`user_bookings_${socket.user.id}`);
  });

  // Handle booking status updates
  socket.on('bookingStatusUpdate', (data) => {
    const { bookingId, status, userId } = data;
    
    // Emit to the booking owner
    io.to(`user_${userId}`).emit('bookingStatusChanged', {
      bookingId,
      status,
      timestamp: new Date(),
    });

    // If it's a new booking, notify approval team
    if (status === 'pending') {
      io.to('booking_approvals').emit('newBookingForApproval', {
        bookingId,
        userId,
        timestamp: new Date(),
      });
    }
  });

  // Handle real-time availability updates
  socket.on('checkAvailability', async (data) => {
    try {
      const { laboratoryId, startTime, endTime } = data;
      
      // This would typically call your booking service to check availability
      const isAvailable = true; // Placeholder
      
      socket.emit('availabilityResult', {
        laboratoryId,
        startTime,
        endTime,
        isAvailable,
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to check availability' });
    }
  });

  // Handle booking reminders
  socket.on('subscribeToReminders', () => {
    socket.join(`reminders_${socket.user.id}`);
  });

  // Broadcast booking updates to relevant users
  const broadcastBookingUpdate = (booking, action) => {
    // Notify the booking owner
    io.to(`user_${booking.userId}`).emit('bookingUpdate', {
      booking,
      action,
      timestamp: new Date(),
    });

    // Notify approval team if needed
    if (['created', 'updated'].includes(action)) {
      io.to('booking_approvals').emit('bookingRequiresAttention', {
        booking,
        action,
        timestamp: new Date(),
      });
    }
  };

  socket.broadcastBookingUpdate = broadcastBookingUpdate;
}
