import Booking from '../models/Booking.js';

export const getBookingsByUser = async (userId) => {
  return await Booking.findAll({ where: { userId } });
};

export const getBookingById = async (id) => {
  return await Booking.findByPk(id);
};
