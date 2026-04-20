import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { IAuthState } from '../../types';
import { setLoading, setError, showNotification } from './settingsSlice';

const initialState: IAuthState = {
  user: null,
  isAuthenticated: false,
  token: localStorage.getItem('token'),
  loading: false,
};

// Асинхронный вход
export const login = createAsyncThunk(
  'user/login',
  async ({ email, password }: { email: string; password: string }, { dispatch }) => {
    dispatch(setLoading(true));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Неверный email или пароль');
      }
      
      const token = 'fake-token-' + Date.now();
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email }));
      localStorage.setItem('isAuth', 'true');
      
      console.log('POST /api/auth/login - 200 OK');
      
      dispatch(showNotification(`Добро пожаловать, ${user.name}!`));
      
      return { 
        user: { 
          id: user.email, 
          name: user.name, 
          email: user.email, 
          createdAt: new Date().toISOString() 
        }, 
        token 
      };
    } catch (error: any) {
      dispatch(setError({ message: error.message, status: 401 }));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Асинхронная регистрация
export const register = createAsyncThunk(
  'user/register',
  async ({ name, email, password }: { name: string; email: string; password: string }, { dispatch }) => {
    dispatch(setLoading(true));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = users.some((u: any) => u.email === email);
      
      if (userExists) {
        throw new Error('Пользователь с таким email уже существует');
      }
      
      const newUser = { name, email, password };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      const token = 'fake-token-' + Date.now();
      localStorage.setItem('token', token);
      
      console.log('POST /api/auth/register - 201 Created');
      
      dispatch(showNotification(`Аккаунт ${email} успешно создан!`));
      
      return { 
        user: { 
          id: email, 
          name, 
          email, 
          createdAt: new Date().toISOString() 
        }, 
        token 
      };
    } catch (error: any) {
      dispatch(setError({ message: error.message, status: 409 }));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Выход
export const logout = createAsyncThunk('user/logout', async (_, { dispatch }) => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  localStorage.setItem('isAuth', 'false');
  
  dispatch(showNotification('Вы вышли из аккаунта'));
  console.log('POST /api/auth/logout - 200 OK');
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        console.log('POST /api/auth/login - 401 Unauthorized');
      })
      // REGISTER
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        console.log('POST /api/auth/register - 409 Conflict');
      })
      // LOGOUT
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        console.log('POST /api/auth/logout - ошибка', action.error);
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;