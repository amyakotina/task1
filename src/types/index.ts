// Пользователь
export interface IUser {
  id: string;
  name: string;
  email: string;
  password?: string; // храним только для API
  createdAt: string;
}

export interface IAuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
}

// Задача
export interface ITask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  categoryId?: string;
  dueDate?: string;
  createdAt: string;
  userId: string;
}

// Категория
export interface ICategory {
  id: string;
  name: string;
  color: string;
  userId: string;
  taskCount?: number;
}

// Уведомление
export interface INotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  read: boolean;
  createdAt: string;
  userId: string;
}

// Статистика
export interface IStatistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  productivity: number;
  tasksByDay: { day: string; count: number }[];
}

// Настройки приложения
export interface ISettingsState {
  isLoading: boolean;
  error: {
    message: string;
    status: number;
  } | null;
  modalOpen: boolean;
}

// API ответ
export interface IApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// API ошибка
export interface IApiError {
  message: string;
  status: number;
}