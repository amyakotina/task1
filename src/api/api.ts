import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { IApiError } from '../types';

const API_URL: string = 'http://localhost:3001/api';

// Расширяем тип для хранения флага повторного запроса
interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Утилиты для работы с токенами
const setApiAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('accessToken');
};

const removeUserFromStorage = () => {
  localStorage.removeItem('user');
};

// Интерсептор запроса - добавляет токен
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Пробуем получить токен из разных ключей для совместимости
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// Интерсептор ответа - обработка ошибок и обновление токена
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as RetryableRequest | undefined;

    // если 401, запрос существует, и мы ещё не пробовали повторить
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Не пытаемся обновить токен для запросов логина/регистрации
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register')
      ) {
        console.error('Authentication failed for login/register');
        return Promise.reject(error);
      }

      originalRequest._retry = true; // ставим флаг, чтобы избежать бесконечного цикла

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        console.log('Attempting to refresh token...');

        // Запрашиваем новый
        const { data } = await axios.post<{ token: string; refreshToken?: string }>(
          `${API_URL}/auth/refresh`,
          { refreshToken },
        );

        // Сохраняем новые токены (для совместимости с вашей системой)
        localStorage.setItem('token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }

        // Обновляем заголовок в axios и в конкретном запросе
        setApiAuthToken(data.token);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
        }

        console.log('Token refreshed successfully');

        // Повторяем исходный запрос
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        
        // Ошибка при обновлении токена – чистим всё и редирект на логин
        removeToken();
        removeUserFromStorage();
        localStorage.removeItem('refreshToken');
        setApiAuthToken(null);

        // Диспатчим событие для React
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));

        // Перенаправляем пользователя на страницу логина, если не там уже
        if (!window.location.pathname.includes('/auth') && 
            !window.location.pathname.includes('/register')) {
          window.location.href = '/auth';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Остальная обработка ошибок 
    if (error.response?.status === 403) {
      console.error('Access denied - 403');
    } else if (error.response?.status === 404) {
      console.error('Resource not found - 404');
    } else if (error.response?.status === 500) {
      console.error('Server error. Please try later - 500');
    } else if (!error.response) {
      console.error('Network error. Check your connection');
    }

    // Формируем стандартизированную ошибку для приложения
    if (error.response) {
      const status: number = error.response.status;
      const message: string = error.response.data?.message || error.message;
      
      console.error(`API Error: ${status} - ${message}`);
      
      return Promise.reject({
        message,
        status
      } as IApiError);
    }
    
    console.error(`API Error: ${error.message}`);
    
    return Promise.reject({
      message: error.message || 'Ошибка соединения с сервером',
      status: 500
    } as IApiError);
  },
);

export default api;