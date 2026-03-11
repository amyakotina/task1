import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    productivity: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Получаем данные текущего пользователя
    const currentUser = localStorage.getItem('currentUser');
    const isAuth = localStorage.getItem('isAuth');

    if (!currentUser || isAuth !== 'true') {
      navigate('/auth');
      return;
    }

    const userData = JSON.parse(currentUser);
    setUser(userData);

    // Получаем статистику пользователя
    const allTasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    const userTasks = allTasks[userData.email] || [];
    
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter((t: any) => t.status === 'done').length;
    const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    setStats({
      totalTasks,
      completedTasks,
      productivity
    });
  }, [navigate]);

  const handleLogout = () => {
    // Удаляем данные авторизации
    localStorage.removeItem('currentUser');
    localStorage.setItem('isAuth', 'false');
    // Перенаправляем на главную
    navigate('/');
  };

  if (!user) {
    return <div className="text-center mt-5">Загрузка...</div>;
  }

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
          <div className="card h-100">
            <div className="card-body text-center">
              <h4>{user.name}</h4>
              <p className="text-muted">{user.email}</p>
              <p>Добро пожаловать в TaskManager!</p>
            </div>
          </div>
        </div>
        
        {/* Данные пользователя */}
        <div className="col-md-8 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title mb-4">Ваши данные</h5>
              <div className="row">
                <div className="col-sm-6">
                  <p><strong>Имя:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Дата регистрации:</strong> {new Date().toLocaleDateString()}</p>
                </div>
                <div className="col-sm-6">
                  <p><strong>Статус:</strong> <span className="badge bg-success">Активен</span></p>
                  <p><strong>Всего задач:</strong> {stats.totalTasks}</p>
                  <p><strong>Выполнено:</strong> {stats.completedTasks}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="row mt-2">
        <div className="col-12">
          <h4 className="mb-4">Быстрые действия</h4>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <Link to="/tasks" className="text-decoration-none">
            <div className="card text-center h-100 hover-shadow" style={{transition: '0.3s', cursor: 'pointer'}}>
              <div className="card-body">
                <h5>Мои задачи</h5>
                <p className="text-muted">Управляйте своими задачами</p>
                <button className="btn btn-outline-primary btn-sm">Перейти →</button>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-3 col-sm-6 mb-3">
          <Link to="/statistics" className="text-decoration-none">
            <div className="card text-center h-100 hover-shadow" style={{transition: '0.3s', cursor: 'pointer'}}>
              <div className="card-body">
                <h5>Статистика</h5>
                <p className="text-muted">Отслеживайте прогресс</p>
                <button className="btn btn-outline-primary btn-sm">Перейти →</button>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-3 col-sm-6 mb-3">
          <Link to="/categories" className="text-decoration-none">
            <div className="card text-center h-100 hover-shadow" style={{transition: '0.3s', cursor: 'pointer'}}>
              <div className="card-body">
                <h5>Категории</h5>
                <p className="text-muted">Организуйте задачи по категориям</p>
                <button className="btn btn-outline-primary btn-sm">Перейти →</button>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-3 col-sm-6 mb-3">
          <Link to="/notifications" className="text-decoration-none">
            <div className="card text-center h-100 hover-shadow" style={{transition: '0.3s', cursor: 'pointer'}}>
              <div className="card-body">
                <h5>Уведомления</h5>
                <p className="text-muted">Проверьте уведомления</p>
                <button className="btn btn-outline-primary btn-sm">Перейти →</button>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Последние задачи */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Последние задачи</h5>
              {stats.totalTasks === 0 ? (
                <p className="text-muted text-center py-4">
                  У вас пока нет задач. 
                  <Link to="/tasks" className="ms-2">Создать первую задачу →</Link>
                </p>
              ) : (
                <p className="text-muted text-center py-4">
                  Здесь будут отображаться ваши последние задачи
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;