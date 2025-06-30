export const createResponse = (data, statusCode = 200) => {
  return {
    success: true,
    statusCode,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const createError = (message, statusCode = 500, details = null) => {
  return {
    success: false,
    statusCode,
    error: message,
    details,
    timestamp: new Date().toISOString(),
  };
};

export const createPaginatedResponse = (data, pagination, statusCode = 200) => {
  return {
    success: true,
    statusCode,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  };
};
