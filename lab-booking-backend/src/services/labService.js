import Laboratory from '../models/Laboratory.js';

export const getAllLabs = async (filters = {}) => {
  return await Laboratory.findAll({ where: filters });
};

export const getLabById = async (id) => {
  return await Laboratory.findByPk(id);
};
