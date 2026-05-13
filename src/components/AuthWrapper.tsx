import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { fetchCurrentUser } from '../store/slices/userSlice';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const dispatch = useAppDispatch(); //для вызова действий
  const location = useLocation();// для получения текущего URL, чтобы знать, где мы находимся
  const { isAuthenticated, loading } = useAppSelector((state) => state.user);
  const [isChecking, setIsChecking] = useState(true);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) { //проверка была выходим
      return;
    }

    const token = localStorage.getItem('token');//берем токен 
    
    if (!token) {//токена нет, пользовательь не авторизован
      setIsChecking(false);//заканчиваем проверку
      hasChecked.current = true;//запоминаем, что проверили
      return;
    }
    
    if (isAuthenticated) { //пользователь аторизован
      setIsChecking(false);
      hasChecked.current = true;
      return;
    }
    
    if (loading) {//данные загружабться, выходим
      return;
    }

  hasChecked.current = true;
  dispatch(fetchCurrentUser())//вызываем асинхронное действие для получения данных пользователя
    .catch(() => { //если ошибка- удаляем токен
      localStorage.removeItem('token');
    })
    .finally(() => { //заканчиваем проверку
      setIsChecking(false);
    });
  }, [dispatch, isAuthenticated, loading]);

  if (isChecking) { //если идет проверка - показываем загрузку
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Проверка авторизации...</span>
        </div>
      </div>
    );
  }

  const pathname = location.pathname; //текущий url
  
  if (isAuthenticated) {//если авторизован
    if (pathname === '/auth' || pathname === '/register') {// не может зайти на страницы входа/регистрации, перекидываем на профиль
      return <Navigate to="/profile" replace />;
    }
    return <>{children}</>; // может зайти на все остальные страницы
  }
  
  if (!isAuthenticated) {//не авторизован
    if (pathname === '/' || pathname === '/auth' || pathname === '/register') {//только на публичные
      return <>{children}</>;
    }
    return <Navigate to="/auth" replace />; // не может зайти на защищённые страницы перекидываем на вход
  }
  
  return <>{children}</>;
};

export default AuthWrapper;