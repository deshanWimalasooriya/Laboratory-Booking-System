import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)

export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

export const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

export const formatTime = (time, format = 'HH:mm') => {
  if (!time) return ''
  return dayjs(time, 'HH:mm').format(format)
}

export const formatRelativeTime = (date) => {
  if (!date) return ''
  return dayjs(date).fromNow()
}

export const isDateInPast = (date) => {
  return dayjs(date).isBefore(dayjs(), 'day')
}

export const isDateToday = (date) => {
  return dayjs(date).isSame(dayjs(), 'day')
}

export const isDateInFuture = (date) => {
  return dayjs(date).isAfter(dayjs(), 'day')
}

export const addDays = (date, days) => {
  return dayjs(date).add(days, 'day').toDate()
}

export const subtractDays = (date, days) => {
  return dayjs(date).subtract(days, 'day').toDate()
}

export const getWeekDays = (startDate = dayjs()) => {
  const days = []
  for (let i = 0; i < 7; i++) {
    days.push(startDate.add(i, 'day'))
  }
  return days
}

export const getMonthDays = (date = dayjs()) => {
  const startOfMonth = date.startOf('month')
  const endOfMonth = date.endOf('month')
  const days = []
  
  for (let day = startOfMonth; day.isBefore(endOfMonth) || day.isSame(endOfMonth); day = day.add(1, 'day')) {
    days.push(day)
  }
  
  return days
}

export const isTimeSlotAvailable = (date, timeSlot, bookedSlots = []) => {
  const slotDateTime = dayjs(`${date} ${timeSlot}`)
  const now = dayjs()
  
  // Check if slot is in the past
  if (slotDateTime.isBefore(now)) {
    return false
  }
  
  // Check if slot is already booked
  return !bookedSlots.some(slot => 
    dayjs(slot.date).isSame(dayjs(date), 'day') && 
    slot.timeSlot === timeSlot
  )
}

export const getTimeSlotLabel = (timeSlot) => {
  return dayjs(timeSlot, 'HH:mm').format('h:mm A')
}

export const parseTimeSlot = (timeSlot) => {
  return dayjs(timeSlot, 'HH:mm')
}

export const getCurrentDate = () => {
  return dayjs().format('YYYY-MM-DD')
}

export const getCurrentTime = () => {
  return dayjs().format('HH:mm')
}

export const getDateRange = (startDate, endDate) => {
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  const days = []
  
  for (let day = start; day.isBefore(end) || day.isSame(end); day = day.add(1, 'day')) {
    days.push(day)
  }
  
  return days
}
