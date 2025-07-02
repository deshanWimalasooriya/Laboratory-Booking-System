import User from '../models/User.js';

export const getUserById = async (id) => {
  return await User.findByPk(id, { attributes: { exclude: ['password'] } });
};

export const updateUser = async (id, updates) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.update(updates);
  return user;
};
