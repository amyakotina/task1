import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

// Components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import AuthWrapper from './components/AuthWrapper';
import CommonWrapper from './components/CommonWrapper';

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

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <CommonWrapper>
          <div className="d-flex flex-column min-vh-100">
            <Header />
            <main className="flex-grow-1">
              <Routes>
                {/* Публичные маршруты - код 200 */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/register" element={<Register />} />
                
                {/* Защищенные маршруты - 401 если не авторизован */}
                <Route element={<AuthWrapper />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/statistics" element={<Statistics />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/notifications" element={<Notifications />} />
                </Route>
                
                {/* 404 страница */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CommonWrapper>
      </BrowserRouter>
    </Provider>
  );
}

export default App;