// Format date as ISO string (yyyy-mm-dd)
export const toISODate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

// Get difference in minutes between two dates
export const diffInMinutes = (start, end) => {
  return Math.floor((new Date(end) - new Date(start)) / (1000 * 60));
};

// Add days to a date
export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// Check if a date is today
export const isToday = (date) => {
  const d = new Date(date);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() &&
         d.getMonth() === today.getMonth() &&
         d.getDate() === today.getDate();
};
