export const emitToUser = (io, userId, event, payload) => {
  io.to(`user_${userId}`).emit(event, payload);
};

export const emitToRoom = (io, roomId, event, payload) => {
  io.to(roomId).emit(event, payload);
};
