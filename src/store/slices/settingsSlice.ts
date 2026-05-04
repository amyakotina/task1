import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ISettingsState, IApiError } from '../../types';

const initialState: ISettingsState = {
  isLoading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<IApiError | null>) => {
      state.error = action.payload;
      if (action.payload) {
        console.log(`❌ Ошибка ${action.payload.status}: ${action.payload.message}`);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    showNotification: (state, action: PayloadAction<string>) => {
      console.log(`🔔 Уведомление: ${action.payload}`);
    },
    hideNotification: (state) => {
    },
  },
});

export const { setLoading, setError, clearError, showNotification, hideNotification } = settingsSlice.actions;
export default settingsSlice.reducer;