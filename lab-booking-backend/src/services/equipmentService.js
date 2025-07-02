import Equipment from '../models/Equipment.js';

export const getEquipmentByLab = async (laboratoryId) => {
  return await Equipment.findAll({ where: { laboratoryId } });
};

export const getEquipmentById = async (id) => {
  return await Equipment.findByPk(id);
};
