import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';
import { INotification, NotificationType, IApiError } from '../../types';

interface NotificationsState {
  notifications: INotification[];
  unreadCount: number;
  loading: boolean;
}

interface IAddNotificationPayload {
  type: NotificationType;
  message: string;
}

interface IFetchNotificationsResponse {
  status: number;
  notifications: INotification[];
}

interface IMarkAsReadResponse {
  status: number;
  notification: INotification;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
};

// GET
export const fetchNotifications = createAsyncThunk<
  INotification[],
  void,
  { rejectValue: IApiError }
>(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<IFetchNotificationsResponse>('/notifications');
      return response.data.notifications;
    } catch (error) {
      return rejectWithValue(error as IApiError);
    }
  }
);

// PATCH 
export const markAsRead = createAsyncThunk<
  INotification,
  number,
  { rejectValue: IApiError }
>(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.patch<IMarkAsReadResponse>(`/notifications/${notificationId}`);
      return response.data.notification;
    } catch (error) {
      return rejectWithValue(error as IApiError);
    }
  }
);

// POST
export const markAllAsRead = createAsyncThunk<
  void,
  void,
  { rejectValue: IApiError }
>(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/notifications/mark-all-read');
      return;
    } catch (error) {
      return rejectWithValue(error as IApiError);
    }
  }
);

// DELETE 
export const deleteNotification = createAsyncThunk<
  number,
  number,
  { rejectValue: IApiError }
>(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error as IApiError);
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addLocalNotification: (state, action: PayloadAction<IAddNotificationPayload>) => {
      const newNotification: INotification = {
        id: Date.now(),
        type: action.payload.type,
        message: action.payload.message,
        time: new Date().toISOString(),
        read: false,
        userId: 'current',
      };
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
      console.log(`🔔 Уведомление: ${action.payload.message}`);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n.id === action.payload.id);
        if (index !== -1) {
          state.notifications[index].read = true;
          state.unreadCount = state.notifications.filter(n => !n.read).length;
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.read = true;
        });
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
        state.unreadCount = state.notifications.filter(n => !n.read).length;
      });
  },
});

export const { addLocalNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;