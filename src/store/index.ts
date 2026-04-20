import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import settingsReducer from './slices/settingsSlice';
import tasksReducer from './slices/tasksSlice';

// Явное объединение редюсеров (как в лекции)
const rootReducer = combineReducers({
  user: userReducer,
  settings: settingsReducer,
  tasks: tasksReducer,
});

// Тип для корневого состояния
export type RootState = ReturnType<typeof rootReducer>;

// Создание store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // отключаем проверку для простоты
    }),
});

// Тип для dispatch
export type AppDispatch = typeof store.dispatch;