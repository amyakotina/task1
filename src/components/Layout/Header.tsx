import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { logout } from '../../store/slices/userSlice';
import { fetchNotifications } from '../../store/slices/notificationsSlice';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.user);
  const { unreadCount } = useAppSelector((state) => state.notifications);
  
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated) {
        try {
          // Удалён dispatch(fetchCurrentUser())
          await dispatch(fetchNotifications()).unwrap();
        } catch (err) {
          const errorMsg = err && typeof err === 'object' && 'message' in err 
            ? String(err.message) 
            : 'Ошибка загрузки данных';
          console.error('Header loading error:', errorMsg);
        }
      }
    };
    
    loadData();
  }, [dispatch, isAuthenticated]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (isAuthenticated) {
      e.preventDefault();
      navigate('/tasks');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <Link 
          className="navbar-brand" 
          to="/"
          onClick={handleLogoClick}
          style={{ cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold' }}
        >
          📋 TaskManager
        </Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {!isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link" to="/">Главная</Link>
              </li>
            )}
            
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/tasks"> 📋 Задачи</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/categories">🏷️ Категории</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/statistics">📊 Статистика</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/notifications" style={{ position: 'relative' }}>
                    🔔 Уведомления
                    {unreadCount > 0 && (
                      <span 
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: '0.7rem' }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">👤 {user?.name || 'Профиль'}</Link>
                </li>
                <li className="nav-item ms-2">
                  <button 
                    className="btn btn-outline-light btn-sm rounded-pill px-3" 
                    onClick={handleLogout}
                    title="Выйти из аккаунта"
                  >
                    Выйти
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/auth">Вход</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Регистрация</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;