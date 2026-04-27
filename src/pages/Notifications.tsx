// src/pages/Notifications.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } from '../store/slices/notificationsSlice';

const Notifications: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, loading } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (id: number) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount > 0 && window.confirm('Отметить все уведомления как прочитанные?')) {
      try {
        await dispatch(markAllAsRead()).unwrap();
        // Обновляем список после отметки
        dispatch(fetchNotifications());
      } catch (error) {
        console.error('Ошибка при отметке всех уведомлений:', error);
      }
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Удалить уведомление?')) {
      dispatch(deleteNotification(id));
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getTimeAgo = (isoTime: string) => {
    const now = new Date();
    const time = new Date(isoTime);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    return `${diffDays} дн назад`;
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-2">Загрузка уведомлений...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>🔔 Уведомления</h2>
          {unreadCount > 0 && (
            <span className="badge bg-primary ms-2">{unreadCount} новых</span>
          )}
        </div>
        {notifications.length > 0 && unreadCount > 0 && (
          <button 
            className="btn btn-outline-primary" 
            onClick={handleMarkAllAsRead}
          >
            Отметить все как прочитанные
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-5">
          <div className="display-1 mb-3">🔕</div>
          <h3 className="mb-3">Нет уведомлений</h3>
          <p className="text-muted">У вас пока нет уведомлений.</p>
        </div>
      ) : (
        <div className="list-group">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`list-group-item list-group-item-action ${!notification.read ? 'bg-light' : ''}`}
              style={{ borderRadius: '12px', marginBottom: '8px', cursor: 'pointer' }}
            >
              <div className="d-flex align-items-center">
                <span className="me-3" style={{ fontSize: '1.8rem' }}>
                  {getIcon(notification.type)}
                </span>
                <div className="flex-grow-1" onClick={() => !notification.read && handleMarkAsRead(notification.id)}>
                  <p className={`mb-1 ${!notification.read ? 'fw-bold' : ''}`}>
                    {notification.message}
                  </p>
                  <small className="text-muted">
                    {getTimeAgo(notification.time)}
                  </small>
                </div>
                {!notification.read && (
                  <span className="badge bg-primary me-2">Новое</span>
                )}
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(notification.id)}
                  title="Удалить уведомление"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;