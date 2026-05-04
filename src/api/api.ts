import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { IApiError } from '../types';

const API_URL: string = 'http://localhost:3001/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Типизированный интерсептор запроса
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token: string | null = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// Типизированный инсерцептор ответа
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>): Promise<IApiError> => {
    if (error.response) {
      const status: number = error.response.status;
      const message: string = error.response.data?.message || error.message;
      
      console.error(`API Error: ${status} - ${message}`);
      
      return Promise.reject({
        message,
        status
      });
    }
    
    console.error(`API Error: ${error.message}`);
    
    return Promise.reject({
      message: error.message || 'Ошибка соединения с сервером',
      status: 500
    });
  }
);

export default api;