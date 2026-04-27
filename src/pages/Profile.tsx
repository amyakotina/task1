import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchCurrentUser, logout } from '../store/slices/userSlice';
import { fetchTasks } from '../store/slices/tasksSlice';
import { fetchCategories } from '../store/slices/categoriesSlice';
import { fetchNotifications } from '../store/slices/notificationsSlice';
import { ITask } from '../types';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, userStats, isAuthenticated, loading } = useAppSelector((state) => state.user);
  const { tasks } = useAppSelector((state) => state.tasks);
  const { categories } = useAppSelector((state) => state.categories);
  const { unreadCount } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    // Загружаем все данные пользователя
    dispatch(fetchCurrentUser());
    dispatch(fetchTasks());
    dispatch(fetchCategories());
    dispatch(fetchNotifications());
  }, [dispatch, isAuthenticated, navigate]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  if (loading || !user) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-2">Загрузка профиля...</p>
      </div>
    );
  }

  const recentTasks: ITask[] = [...tasks].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 3);


  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Личный кабинет</h2>
            <button className="btn btn-outline-danger" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </div>
      </div>
      
      <div className="row">
        {/* Информация о пользователе */}
        <div className="col-md-4 mb-4">
          <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
            <div className="card-body text-center p-4">
              <div className="display-1 mb-3">👤</div>
              <h4 className="mb-2">{user.name}</h4>
              <p className="text-muted">{user.email}</p>
              <hr />
              <p className="mb-1">
                <strong>Дата регистрации:</strong>
              </p>
              <p className="text-muted">{new Date(user.createdAt).toLocaleDateString('ru-RU')}</p>
              <span className="badge bg-success">Активен</span>
            </div>
          </div>
        </div>
        
        {/* Статистика */}
        <div className="col-md-8 mb-4">
          <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <h5 className="card-title mb-4">📊 Ваша статистика</h5>
              <div className="row text-center">
                <div className="col-4">
                  <div className="display-4 text-primary">{userStats?.totalTasks || 0}</div>
                  <p className="text-muted mb-0">Всего задач</p>
                </div>
                <div className="col-4">
                  <div className="display-4 text-success">{userStats?.completedTasks || 0}</div>
                  <p className="text-muted mb-0">Выполнено</p>
                </div>
                <div className="col-4">
                  <div className="display-4 text-info">{userStats?.productivity || 0}%</div>
                  <p className="text-muted mb-0">Продуктивность</p>
                </div>
              </div>
              
              <hr className="my-4" />
              
              <div className="row">
                <div className="col-6">
                  <p><strong>📋 Категорий:</strong> {categories.length}</p>
                </div>
                <div className="col-6">
                  <p><strong>🔔 Уведомлений:</strong> {unreadCount} непрочитанных</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="row mt-2">
        <div className="col-12">
          <h4 className="mb-4">⚡ Быстрые действия</h4>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <Link to="/tasks" className="text-decoration-none">
            <div className="card text-center h-100 shadow-sm" style={{ borderRadius: '16px', transition: '0.3s', cursor: 'pointer' }}>
              <div className="card-body">
                <div className="display-4 mb-2">📋</div>
                <h5>Мои задачи</h5>
                <p className="text-muted small">Управляйте своими задачами</p>
                <button className="btn btn-outline-primary btn-sm">Перейти →</button>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-3 col-sm-6 mb-3">
          <Link to="/categories" className="text-decoration-none">
            <div className="card text-center h-100 shadow-sm" style={{ borderRadius: '16px', transition: '0.3s', cursor: 'pointer' }}>
              <div className="card-body">
                <div className="display-4 mb-2">🏷️</div>
                <h5>Категории</h5>
                <p className="text-muted small">Организуйте задачи по категориям</p>
                <button className="btn btn-outline-primary btn-sm">Перейти →</button>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-3 col-sm-6 mb-3">
          <Link to="/notifications" className="text-decoration-none">
            <div className="card text-center h-100 shadow-sm" style={{ borderRadius: '16px', transition: '0.3s', cursor: 'pointer' }}>
              <div className="card-body">
                <div className="display-4 mb-2">🔔</div>
                <h5>Уведомления</h5>
                <p className="text-muted small">
                  {unreadCount > 0 ? `${unreadCount} новых` : 'Нет новых'}
                </p>
                <button className="btn btn-outline-primary btn-sm">Перейти →</button>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-center h-100 shadow-sm" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div className="card-body">
              <div className="display-4 mb-2">🎯</div>
              <h5>Прогресс</h5>
              <p className="small">{userStats?.productivity || 0}% выполнено</p>
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-light" 
                  style={{ width: `${userStats?.productivity || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Последние задачи */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <h5 className="card-title mb-4">📝 Последние задачи</h5>
              {recentTasks.length === 0 ? (
                <p className="text-muted text-center py-4">
                  У вас пока нет задач. 
                  <Link to="/tasks" className="ms-2">Создать первую задачу →</Link>
                </p>
              ) : (
                <div className="list-group">
                  {recentTasks.map(task => (
                    <div key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <span className={`badge ${task.status === 'done' ? 'bg-success' : task.status === 'in-progress' ? 'bg-primary' : 'bg-secondary'} me-2`}>
                          {task.status === 'done' ? '✅' : task.status === 'in-progress' ? '🔄' : '📋'}
                        </span>
                        {task.title}
                      </div>
                      <small className="text-muted">
                        {new Date(task.createdAt).toLocaleDateString('ru-RU')}
                      </small>
                    </div>
                  ))}
                </div>
              )}
              {recentTasks.length > 0 && (
                <div className="text-center mt-3">
                  <Link to="/tasks" className="btn btn-outline-primary">Все задачи →</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;