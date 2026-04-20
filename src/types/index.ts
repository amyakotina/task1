// Пользователь
export interface IUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// Состояние авторизации
export interface IAuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
}

// Задача
export interface ITask {
  id: number;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  categoryId?: number;
  userId: string;
  createdAt: string;
}

// Категория
export interface ICategory {
  id: number;
  name: string;
  color: string;
  userId: string;
}

// Уведомление
export interface INotification {
  id: number;
  type: 'info' | 'success' | 'warning';
  message: string;
  time: string;
  read: boolean;
  userId: string;
}

// Настройки приложения
export interface ISettingsState {
  isLoading: boolean;
  error: { message: string; status: number } | null;
}

// API ошибка
export interface IApiError {
  message: string;
  status: number;
}