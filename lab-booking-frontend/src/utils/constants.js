export const USER_ROLES = {
  ADMIN: 'admin',
  LECTURE_IN_CHARGE: 'lecture_in_charge',
  TECHNICAL_OFFICER: 'technical_officer',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student'
}

export const PERMISSIONS = {
  // User management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  
  // Laboratory management
  MANAGE_LABS: 'manage_labs',
  VIEW_LABS: 'view_labs',
  
  // Equipment management
  MANAGE_EQUIPMENT: 'manage_equipment',
  VIEW_EQUIPMENT: 'view_equipment',
  
  // Booking management
  CREATE_BOOKINGS: 'create_bookings',
  VIEW_BOOKINGS: 'view_bookings',
  VIEW_OWN_BOOKINGS: 'view_own_bookings',
  MANAGE_BOOKINGS: 'manage_bookings',
  MANAGE_OWN_BOOKINGS: 'manage_own_bookings',
  APPROVE_BOOKINGS: 'approve_bookings',
  
  // Analytics and reporting
  VIEW_ANALYTICS: 'view_analytics',
  GENERATE_REPORTS: 'generate_reports',
  
  // System settings
  SYSTEM_SETTINGS: 'system_settings'
}

export const BOOKING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  REJECTED: 'rejected'
}

export const LAB_TYPES = {
  COMPUTER: 'computer',
  CHEMISTRY: 'chemistry',
  PHYSICS: 'physics',
  BIOLOGY: 'biology',
  ENGINEERING: 'engineering',
  ELECTRONICS: 'electronics',
  MECHANICAL: 'mechanical'
}

export const EQUIPMENT_STATUS = {
  AVAILABLE: 'available',
  IN_USE: 'in_use',
  MAINTENANCE: 'maintenance',
  OUT_OF_ORDER: 'out_of_order',
  RESERVED: 'reserved'
}

export const TIME_SLOTS = [
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' }
]

export const NOTIFICATION_TYPES = {
  BOOKING_APPROVED: 'booking_approved',
  BOOKING_REJECTED: 'booking_rejected',
  BOOKING_REMINDER: 'booking_reminder',
  EQUIPMENT_MAINTENANCE: 'equipment_maintenance',
  SYSTEM_ANNOUNCEMENT: 'system_announcement'
}
