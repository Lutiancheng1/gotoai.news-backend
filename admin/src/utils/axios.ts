import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? process.env.REACT_APP_API_URL : process.env.REACT_APP_PUBLIC_API_URL,
  timeout: 5000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token || localStorage.getItem('token');
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
    if (error.response?.status === 403 && error.response?.data?.message === '账号已被停用，请联系管理员') {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 