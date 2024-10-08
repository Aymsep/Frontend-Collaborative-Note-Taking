import axios from 'axios';
import { removeToken } from '../Utils/token.Utils';

const url = import.meta.env.VITE_BASE_URL ? import.meta.env.VITE_BASE_URL + '/api/v1' : 'http://localhost:3000/api/v1'

const axiosInstance = axios.create({
  baseURL:url, 
  headers: {
      'Content-Type': 'application/json',
},
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 403) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
