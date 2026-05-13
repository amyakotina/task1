import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { IAuthState, IUser, IUserStats, IApiError } from '../../types';

interface IAuthResponse {
  status: number;
  message: string;
  user: IUser;
  token: string;
  refreshToken?: string;
}

interface IUserMeResponse {
  status: number;
  user: IUser;
  stats: IUserStats;
}

const initialState: IAuthState = {
  user: null,
  userStats: null,
  isAuthenticated: false,
  token: localStorage.getItem('token'),
  loading: false,
};

// Регистрация
export const register = createAsyncThunk<
  { user: IUser; token: string; refreshToken?: string },
  { name: string; email: string; password: string },
  { rejectValue: IApiError }
>(
  'user/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      console.log('📝 POST /api/auth/register');
      const response = await api.post<IAuthResponse>('/auth/register', { name, email, password });
      const { token, user, refreshToken } = response.data; // Получаем токен от бэкенда и сохраняем
      
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      console.log('✅ Регистрация успешна');
      return { user, token, refreshToken };
    } catch (error) {
      console.error('❌ Ошибка регистрации:', error);
      return rejectWithValue(error as IApiError);
    }
  }
);

// Вход
export const login = createAsyncThunk<
  { user: IUser; token: string; refreshToken?: string },
  { email: string; password: string },
  { rejectValue: IApiError }
>(
  'user/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('🔐 POST /api/auth/login');
      const response = await api.post<IAuthResponse>('/auth/login', { email, password });
      const { token, user, refreshToken } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('accessToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      console.log('✅ Вход выполнен');
      return { user, token, refreshToken };
    } catch (error) {
      console.error('❌ Ошибка входа:', error);
      return rejectWithValue(error as IApiError);
    }
  }
);

// Получение текущего пользователя
export const fetchCurrentUser = createAsyncThunk<
  { user: IUser; stats: IUserStats },
  void,
  { rejectValue: IApiError }
>(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      console.log('👤 GET /api/users/me');
      const response = await api.get<IUserMeResponse>('/users/me');
      console.log('✅ Данные пользователя получены');
      return { user: response.data.user, stats: response.data.stats };
    } catch (error) {
      console.error('❌ Ошибка получения пользователя:', error);
      return rejectWithValue(error as IApiError);
    }
  }
);

// Выход
export const logout = createAsyncThunk<void, void, { rejectValue: IApiError }>(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🚪 POST /api/auth/logout');
      await api.post('/auth/logout');
    } catch (error) {
      console.log('⚠️ Ошибка при выходе (игнорируем)');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      console.log('✅ Выход выполнен, все токены удалены');
    }
  }
);

// Обновление токена
export const refreshAccessToken = createAsyncThunk<
  { token: string; refreshToken?: string },
  void,
  { rejectValue: IApiError }
>(
  'user/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }
      
      console.log('🔄 POST /api/auth/refresh');
      const response = await api.post<{ token: string; refreshToken?: string }>('/auth/refresh', {
        refreshToken,
      });
      
      const { token, refreshToken: newRefreshToken } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('accessToken', token);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      
      console.log('✅ Токен успешно обновлён');
      return { token, refreshToken: newRefreshToken };
    } catch (error) {
      console.error('❌ Ошибка обновления токена:', error);
      
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return rejectWithValue(error as IApiError);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.userStats = null;
      state.isAuthenticated = false;
      state.token = null;
      state.loading = false;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        console.log('🔐 Состояние: пользователь авторизован');
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        console.log('❌ Ошибка входа:', action.payload?.message);
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        console.log('✅ Состояние: пользователь зарегистрирован');
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        console.log('❌ Ошибка регистрации:', action.payload?.message);
      })
      
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.userStats = action.payload.stats;
        state.isAuthenticated = true;
        console.log('👤 Данные пользователя загружены');
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.userStats = null;
        state.token = null;
        console.log('❌ Ошибка загрузки пользователя:', action.payload?.message);
      })
      
      // Refresh token
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isAuthenticated = true;
        console.log('🔄 Токен обновлён в состоянии');
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.userStats = null;
        state.token = null;
        console.log('❌ Токен не обновлён, сессия завершена');
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.userStats = null;
        state.isAuthenticated = false;
        state.token = null;
        state.loading = false;
        console.log('👋 Состояние: пользователь вышел');
      });
  },
});

export const { clearUser, setAuthenticated } = userSlice.actions;
export default userSlice.reducer;