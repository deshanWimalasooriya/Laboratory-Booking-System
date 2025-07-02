import ChatRoom from '../models/ChatRoom.js';

export const getUserChatRooms = async (userId) => {
  // Add your logic for fetching chat rooms for a user
  return await ChatRoom.findAll();
};
