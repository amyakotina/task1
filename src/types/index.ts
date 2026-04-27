// src/types/index.ts

// Пользователь
export interface IUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface IUserStats {
  totalTasks: number;
  completedTasks: number;
  productivity: number;
}

export interface IAuthState {
  user: IUser | null;
  userStats: IUserStats | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
}

// Задача
export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface ITask {
  id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  categoryId: number | null;
  userId: string;
  createdAt: string;
}

// Категория
export interface ICategory {
  id: number;
  name: string;
  color: string;
  count: number;
  userId: string;
}

// Уведомление
export type NotificationType = 'info' | 'success' | 'warning';

export interface INotification {
  id: number;
  type: NotificationType;
  message: string;
  time: string;
  read: boolean;
  userId: string;
}

// API
export interface IApiResponse<T = unknown> {
  status: number;
  message?: string;
  data?: T;
}

// 👇 ЭТОТ ТИП НУЖЕН ВСЕМ СЛАЙСАМ
export interface IApiError {
  message: string;
  status: number;
}

// Настройки
export interface ISettingsState {
  isLoading: boolean;
  error: IApiError | null;
}

// Payload типы
export interface ICreateTaskPayload {
  title: string;
  priority: TaskPriority;
  categoryId?: number;
}

export interface IUpdateTaskPayload {
  taskId: number;
  status?: TaskStatus;
}

export interface IPatchTaskPayload {
  taskId: number;
  priority?: TaskPriority;
}

export interface ICreateCategoryPayload {
  name: string;
  color?: string;
}

export interface IUpdateCategoryPayload {
  categoryId: number;
  name?: string;
  color?: string;
}

// RootState тип (будет определен в store)
export type RootState = import('../store').RootState;