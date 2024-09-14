import api from './axiosInstance';

export const getUsers = async () => {
  return api.get('/users');  // API to fetch all users
};
