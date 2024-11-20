import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 5000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 