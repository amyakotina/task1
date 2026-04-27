// src/store/slices/tasksSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { 
  ITask, 
  TaskStatus, 
  TaskPriority, 
  ICreateTaskPayload, 
  IUpdateTaskPayload, 
  IPatchTaskPayload,
  IApiError,
  RootState
} from '../../types';  // 👈 ДОБАВЛЯЕМ RootState и IApiError
import { setLoading, setError } from './settingsSlice';
import { addLocalNotification } from './notificationsSlice';

interface TasksState {
  tasks: ITask[];
  loading: boolean;
}

interface IFetchTasksResponse {
  status: number;
  tasks: ITask[];
}

interface ITaskResponse {
  status: number;
  message: string;
  task: ITask;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
};

// GET
export const fetchTasks = createAsyncThunk<
  ITask[],
  void,
  { rejectValue: IApiError }
>(
  'tasks/fetchTasks',
  async (_, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    try {
      const response = await api.get<IFetchTasksResponse>('/tasks');
      console.log(`📋 Получено ${response.data.tasks.length} задач`);
      dispatch(setLoading(false));
      return response.data.tasks;
    } catch (error) {
      const apiError = error as IApiError;
      dispatch(setLoading(false));
      dispatch(setError({ message: apiError.message, status: apiError.status }));
      return rejectWithValue(apiError);
    }
  }
);

// POST - создание задачи
export const createTask = createAsyncThunk<
  ITask,
  ICreateTaskPayload,
  { rejectValue: IApiError }
>(
  'tasks/createTask',
  async ({ title, priority, categoryId }, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    try {
      const response = await api.post<ITaskResponse>('/tasks', { title, priority, categoryId });
      console.log(`✅ Задача "${title}" создана`);
      
      dispatch(addLocalNotification({
        type: 'success',
        message: `✅ Задача "${title}" успешно создана!`
      }));
      
      dispatch(setLoading(false));
      return response.data.task;
    } catch (error) {
      const apiError = error as IApiError;
      dispatch(setLoading(false));
      dispatch(setError({ message: apiError.message, status: apiError.status }));
      return rejectWithValue(apiError);
    }
  }
);

// PUT - обновление статуса
export const updateTask = createAsyncThunk<
  ITask,
  IUpdateTaskPayload,
  { rejectValue: IApiError; state: RootState }
>(
  'tasks/updateTask',
  async ({ taskId, status }, { dispatch, getState, rejectWithValue }) => {
    dispatch(setLoading(true));
    try {
      const state = getState();
      const task = state.tasks.tasks.find((t: ITask) => t.id === taskId);
      const taskTitle = task?.title || 'Задача';
      
      const response = await api.put<ITaskResponse>(`/tasks/${taskId}`, { status });
      
      let statusMessage = '';
      if (status === 'done') statusMessage = 'Выполнена! 🎉';
      else if (status === 'in-progress') statusMessage = 'В работе ⚡';
      else statusMessage = 'Возвращена к выполнению 📋';
      
      dispatch(addLocalNotification({
        type: status === 'done' ? 'success' : 'info',
        message: `📌 Задача "${taskTitle}" ${statusMessage}`
      }));
      
      dispatch(setLoading(false));
      return response.data.task;
    } catch (error) {
      const apiError = error as IApiError;
      dispatch(setLoading(false));
      dispatch(setError({ message: apiError.message, status: apiError.status }));
      return rejectWithValue(apiError);
    }
  }
);

// PATCH - обновление приоритета
export const patchTask = createAsyncThunk<
  ITask,
  IPatchTaskPayload,
  { rejectValue: IApiError; state: RootState }
>(
  'tasks/patchTask',
  async ({ taskId, priority }, { dispatch, getState, rejectWithValue }) => {
    dispatch(setLoading(true));
    try {
      const state = getState();
      const task = state.tasks.tasks.find((t: ITask) => t.id === taskId);
      const taskTitle = task?.title || 'Задача';
      
      const response = await api.patch<ITaskResponse>(`/tasks/${taskId}`, { priority });
      
      const priorityText: Record<TaskPriority, string> = {
        high: '🔴 Высокий',
        medium: '🟡 Средний',
        low: '🟢 Низкий'
      };
      
      dispatch(addLocalNotification({
        type: 'info',
        message: `🎯 Приоритет задачи "${taskTitle}" изменен на ${priorityText[priority!]}`
      }));
      
      dispatch(setLoading(false));
      return response.data.task;
    } catch (error) {
      const apiError = error as IApiError;
      dispatch(setLoading(false));
      dispatch(setError({ message: apiError.message, status: apiError.status }));
      return rejectWithValue(apiError);
    }
  }
);

// DELETE
export const deleteTask = createAsyncThunk<
  number,
  number,
  { rejectValue: IApiError; state: RootState }
>(
  'tasks/deleteTask',
  async (taskId, { dispatch, getState, rejectWithValue }) => {
    dispatch(setLoading(true));
    try {
      const state = getState();
      const task = state.tasks.tasks.find((t: ITask) => t.id === taskId);
      const taskTitle = task?.title || 'Задача';
      
      await api.delete(`/tasks/${taskId}`);
      
      dispatch(addLocalNotification({
        type: 'warning',
        message: `🗑️ Задача "${taskTitle}" удалена`
      }));
      
      dispatch(setLoading(false));
      return taskId;
    } catch (error) {
      const apiError = error as IApiError;
      dispatch(setLoading(false));
      dispatch(setError({ message: apiError.message, status: apiError.status }));
      return rejectWithValue(apiError);
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(patchTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
      });
  },
});

export default tasksSlice.reducer;