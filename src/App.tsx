// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

// Components
import Header from './components/Layout/Header';
import AuthWrapper from './components/AuthWrapper';
import CommonWrapper from './components/CommonWrapper';

// Pages (8 страниц)
import Landing from './pages/Landing';           // 1. Лендинг
import Auth from './pages/Auth';                 // 2. Авторизация
import Register from './pages/Register';         // 3. Регистрация
import Profile from './pages/Profile';           // 4. Личный кабинет
import Tasks from './pages/Tasks';               // 5. Страница после авторизации 
import Categories from './pages/Categories';     // 6. Дополнительная страница 1
import Notifications from './pages/Notifications'; // 7. Дополнительная страница 2
import Statistics from './pages/Statistics';     // 8. Дополнительная страница 3 
import NotFound from './pages/NotFound';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <CommonWrapper>
          <div className="d-flex flex-column min-vh-100">
            <Header />
            <main className="flex-grow-1">
              <Routes>
                {/* Публичные маршруты */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/register" element={<Register />} />
                
                {/* Защищенные маршруты */}
                <Route element={<AuthWrapper />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/statistics" element={<Statistics />} /> {/* НОВАЯ страница */}
                </Route>
                
                {/* 404 */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>
          </div>
        </CommonWrapper>
      </BrowserRouter>
    </Provider>
  );
}

export default App;