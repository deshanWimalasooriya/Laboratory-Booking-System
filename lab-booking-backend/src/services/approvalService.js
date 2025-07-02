import Booking from '../models/Booking.js';

export const getPendingBookings = async () => {
  return await Booking.findAll({ where: { status: 'pending' } });
};

export const approveBooking = async (id, approvedBy) => {
  const booking = await Booking.findByPk(id);
  if (!booking) return null;
  await booking.update({ status: 'approved', approvedBy, approvedAt: new Date() });
  return booking;
};
