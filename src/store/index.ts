import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import settingsReducer from './slices/settingsSlice';
import tasksReducer from './slices/tasksSlice';
import categoriesReducer from './slices/categoriesSlice';
import notificationsReducer from './slices/notificationsSlice';

// Явное объединение редюсеров
const rootReducer = combineReducers({
  user: userReducer,
  settings: settingsReducer,
  tasks: tasksReducer,
  categories: categoriesReducer,
  notifications: notificationsReducer,
});

// Тип для корневого состояния
export type RootState = ReturnType<typeof rootReducer>;

// Создание store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Тип для dispatch
export type AppDispatch = typeof store.dispatch;