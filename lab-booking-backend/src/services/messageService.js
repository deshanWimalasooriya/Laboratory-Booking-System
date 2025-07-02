import Message from '../models/Message.js';

export const getMessagesByChatRoom = async (chatRoomId) => {
  return await Message.findAll({ where: { chatRoomId } });
};

export const sendMessage = async (data) => {
  return await Message.create(data);
};
