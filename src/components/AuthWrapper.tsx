import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/reduxHooks';

const AuthWrapper: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.user);

  if (!isAuthenticated) {
    // Возвращаем 401 Unauthorized
    console.log('🔒 Доступ запрещен: 401 Unauthorized');
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export default AuthWrapper;