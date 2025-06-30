import { Op } from 'sequelize';
import Booking from '../models/Booking.js';

export const checkBookingConflicts = async (laboratoryId, startTime, endTime, excludeBookingId = null) => {
  const whereClause = {
    laboratoryId,
    status: ['approved', 'pending'],
    [Op.or]: [
      {
        startTime: {
          [Op.between]: [startTime, endTime],
        },
      },
      {
        endTime: {
          [Op.between]: [startTime, endTime],
        },
      },
      {
        [Op.and]: [
          { startTime: { [Op.lte]: startTime } },
          { endTime: { [Op.gte]: endTime } },
        ],
      },
    ],
  };

  if (excludeBookingId) {
    whereClause.id = { [Op.ne]: excludeBookingId };
  }

  const conflicts = await Booking.findAll({
    where: whereClause,
    attributes: ['id', 'startTime', 'endTime', 'title', 'status'],
  });

  return conflicts;
};

export const generateBookingNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BK${year}${month}${day}${random}`;
};

export const calculateBookingDuration = (startTime, endTime) => {
  return Math.ceil((new Date(endTime) - new Date(startTime)) / (1000 * 60)); // Duration in minutes
};

export const isBookingEditable = (booking) => {
  const now = new Date();
  const startTime = new Date(booking.startTime);
  const timeDiff = startTime - now;
  const hoursUntilStart = timeDiff / (1000 * 60 * 60);
  
  return ['draft', 'pending'].includes(booking.status) && hoursUntilStart > 2;
};

export const isBookingCancellable = (booking) => {
  const now = new Date();
  const startTime = new Date(booking.startTime);
  const timeDiff = startTime - now;
  const hoursUntilStart = timeDiff / (1000 * 60 * 60);
  
  return ['pending', 'approved'].includes(booking.status) && hoursUntilStart > 1;
};
