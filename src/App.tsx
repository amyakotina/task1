import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Statistics from './pages/Statistics';
import Categories from './pages/Categories';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';

// Временная проверка авторизации (позже заменится на Redux)
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = localStorage.getItem('isAuth') === 'true';
  return isAuth ? <>{children}</> : <Navigate to="/auth" />;
};

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          {/* Публичные страницы */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Register />} />
          
          {/* Защищенные страницы (требуют авторизации) */}
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          {/* Страница данных после авторизации */}
          <Route path="/tasks" element={
            <PrivateRoute>
              <Tasks />
            </PrivateRoute>
          } />
          
          {/* 3 дополнительные уникальные страницы */}
          <Route path="/statistics" element={
            <PrivateRoute>
              <Statistics />
            </PrivateRoute>
          } />
          
          <Route path="/categories" element={
            <PrivateRoute>
              <Categories />
            </PrivateRoute>
          } />
          
          <Route path="/notifications" element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          } />
          
          {/* 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;