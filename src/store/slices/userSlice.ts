// src/store/slices/userSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { IAuthState, IUser, IUserStats, IApiError } from '../../types'; // 👈 ДОБАВЛЯЕМ IApiError

interface IAuthResponse {
  status: number;
  message: string;
  user: IUser;
  token: string;
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
  { user: IUser; token: string },
  { name: string; email: string; password: string },
  { rejectValue: IApiError }
>(
  'user/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      console.log('📝 POST /api/auth/register');
      const response = await api.post<IAuthResponse>('/auth/register', { name, email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      console.log('✅ Регистрация успешна');
      return { user, token };
    } catch (error) {
      return rejectWithValue(error as IApiError);
    }
  }
);

// Вход
export const login = createAsyncThunk<
  { user: IUser; token: string },
  { email: string; password: string },
  { rejectValue: IApiError }
>(
  'user/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('🔐 POST /api/auth/login');
      const response = await api.post<IAuthResponse>('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      console.log('✅ Вход выполнен');
      return { user, token };
    } catch (error) {
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
      console.log('✅ Выход выполнен');
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        console.log('❌ Ошибка входа');
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state) => {
        state.loading = false;
        console.log('❌ Ошибка регистрации');
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.userStats = action.payload.stats;
        state.isAuthenticated = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.userStats = null;
        state.isAuthenticated = false;
        state.token = null;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;