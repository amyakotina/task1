import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { fetchCurrentUser } from '../store/slices/userSlice';

const AuthWrapper: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.user);
  const [isChecking, setIsChecking] = useState(true);  // ← НОВЫЙ ФЛАГ!
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Если токена нет — сразу говорим, что проверка закончена
    if (!token) {
      setIsChecking(false);
      return;
    }
    
    // Если уже авторизованы — проверка не нужна
    if (isAuthenticated) {
      setIsChecking(false);
      return;
    }
    
    // Если загрузка уже идёт — ждём
    if (loading) {
      return;
    }
    
    // Токен есть, но не авторизованы — проверяем
    dispatch(fetchCurrentUser())
      .unwrap()
      .catch(() => {
        // Токен невалидный, удаляем
        localStorage.removeItem('token');
      })
      .finally(() => {
        setIsChecking(false);  // ← Проверка закончена!
      });
  }, [dispatch, isAuthenticated, loading]);
  
  if (isChecking) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Проверка авторизации...</span>
        </div>
      </div>
    );
  }
  
  // Проверка закончена — теперь можно принять решение
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <Outlet />;
};

export default AuthWrapper;