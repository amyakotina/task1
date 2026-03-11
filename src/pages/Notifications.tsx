import React, { useState, useEffect } from 'react';

interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning';
  message: string;
  time: string;
  read: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получаем текущего пользователя
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const userEmail = JSON.parse(currentUser).email;
    
    // Получаем уведомления конкретного пользователя
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '{}');
    const userNotifications = allNotifications[userEmail] || [];
    
    setNotifications(userNotifications);
    setLoading(false);
  }, []);

  const markAsRead = (id: number) => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const userEmail = JSON.parse(currentUser).email;
    
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '{}');
    const userNotifications = allNotifications[userEmail] || [];
    
    const updatedNotifications = userNotifications.map((n: Notification) => 
      n.id === id ? { ...n, read: true } : n
    );
    
    allNotifications[userEmail] = updatedNotifications;
    localStorage.setItem('notifications', JSON.stringify(allNotifications));
    setNotifications(updatedNotifications);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Загрузка...</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Уведомления</h2>

      {notifications.length === 0 ? (
        <div className="text-center py-5">
          <h3>Нет уведомлений</h3>
          <p className="text-muted">У вас пока нет новых уведомлений</p>
        </div>
      ) : (
        <div className="list-group">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`list-group-item list-group-item-action ${!notification.read ? 'fw-bold' : ''}`}
              onClick={() => markAsRead(notification.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex align-items-center">
                <span className="me-3" style={{fontSize: '1.5rem'}}>
                  {getIcon(notification.type)}
                </span>
                <div className="flex-grow-1">
                  <p className="mb-1">{notification.message}</p>
                  <small className="text-muted">{notification.time}</small>
                </div>
                {!notification.read && (
                  <span className="badge bg-primary">Новое</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;