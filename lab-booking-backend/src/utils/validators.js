import * as yup from 'yup';

// User registration validation
export const validateRegistration = (data) => {
  const schema = yup.object({
    firstName: yup.string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must not exceed 50 characters')
      .required('First name is required'),
    lastName: yup.string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must not exceed 50 characters')
      .required('Last name is required'),
    email: yup.string()
      .email('Please provide a valid email')
      .required('Email is required'),
    password: yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    role: yup.string()
      .oneOf(['student', 'instructor', 'technical_officer', 'lecture_in_charge'])
      .required('Role is required'),
    phone: yup.string().nullable(),
    department: yup.string().nullable(),
    studentId: yup.string().nullable(),
    employeeId: yup.string().nullable(),
  });

  try {
    schema.validateSync(data, { abortEarly: false });
    return { error: null };
  } catch (error) {
    return { error };
  }
};

// User login validation
export const validateLogin = (data) => {
  const schema = yup.object({
    email: yup.string()
      .email('Please provide a valid email')
      .required('Email is required'),
    password: yup.string()
      .required('Password is required'),
  });

  try {
    schema.validateSync(data, { abortEarly: false });
    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Laboratory validation
export const validateLaboratory = (data) => {
  const schema = yup.object({
    name: yup.string()
      .min(3, 'Laboratory name must be at least 3 characters')
      .max(100, 'Laboratory name must not exceed 100 characters')
      .required('Laboratory name is required'),
    code: yup.string()
      .matches(/^[A-Z0-9-]+$/, 'Laboratory code must contain only uppercase letters, numbers, and hyphens')
      .required('Laboratory code is required'),
    capacity: yup.number()
      .min(1, 'Capacity must be at least 1')
      .max(200, 'Capacity cannot exceed 200')
      .required('Capacity is required'),
    location: yup.string()
      .required('Location is required'),
    labType: yup.string()
      .oneOf(['computer', 'chemistry', 'physics', 'biology', 'engineering', 'research', 'general'])
      .required('Lab type is required'),
  });

  try {
    schema.validateSync(data, { abortEarly: false });
    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Booking validation
export const validateBooking = (data) => {
  const schema = yup.object({
    laboratoryId: yup.string()
      .required('Laboratory ID is required'),
    title: yup.string()
      .min(5, 'Title must be at least 5 characters')
      .max(200, 'Title must not exceed 200 characters')
      .required('Title is required'),
    purpose: yup.string()
      .oneOf(['lecture', 'practical', 'research', 'meeting', 'exam', 'workshop', 'other'])
      .required('Purpose is required'),
    startTime: yup.date()
      .min(new Date(), 'Start time must be in the future')
      .required('Start time is required'),
    endTime: yup.date()
      .min(yup.ref('startTime'), 'End time must be after start time')
      .required('End time is required'),
    expectedAttendees: yup.number()
      .min(1, 'Expected attendees must be at least 1')
      .required('Expected attendees is required'),
  });

  try {
    schema.validateSync(data, { abortEarly: false });
    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Equipment validation
export const validateEquipment = (data) => {
  const schema = yup.object({
    name: yup.string()
      .min(2, 'Equipment name must be at least 2 characters')
      .max(100, 'Equipment name must not exceed 100 characters')
      .required('Equipment name is required'),
    code: yup.string()
      .required('Equipment code is required'),
    category: yup.string()
      .oneOf(['computer', 'microscope', 'projector', 'whiteboard', 'furniture', 'safety', 'measurement', 'other'])
      .required('Category is required'),
    laboratoryId: yup.string()
      .required('Laboratory ID is required'),
    status: yup.string()
      .oneOf(['working', 'not_working', 'under_repair', 'maintenance', 'retired'])
      .required('Status is required'),
    condition: yup.string()
      .oneOf(['excellent', 'good', 'fair', 'poor'])
      .required('Condition is required'),
  });

  try {
    schema.validateSync(data, { abortEarly: false });
    return { error: null };
  } catch (error) {
    return { error };
  }
};
