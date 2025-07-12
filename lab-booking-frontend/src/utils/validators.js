import * as yup from 'yup'

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
})

export const bookingSchema = yup.object({
  labId: yup
    .string()
    .required('Laboratory is required'),
  date: yup
    .date()
    .min(new Date(), 'Date cannot be in the past')
    .required('Date is required'),
  timeSlot: yup
    .string()
    .required('Time slot is required'),
  purpose: yup
    .string()
    .min(10, 'Purpose must be at least 10 characters')
    .required('Purpose is required'),
  equipmentIds: yup
    .array()
    .of(yup.string()),
})

export const labSchema = yup.object({
  name: yup
    .string()
    .min(3, 'Lab name must be at least 3 characters')
    .required('Lab name is required'),
  type: yup
    .string()
    .required('Lab type is required'),
  capacity: yup
    .number()
    .positive('Capacity must be a positive number')
    .integer('Capacity must be a whole number')
    .required('Capacity is required'),
  location: yup
    .string()
    .required('Location is required'),
  description: yup
    .string()
    .min(10, 'Description must be at least 10 characters'),
})

