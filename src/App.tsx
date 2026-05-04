import { useEffect, useRef } from 'react';
import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

import { useAppDispatch, useAppSelector } from './hooks/reduxHooks'; // ← ИСПРАВЛЕНО
import { fetchCurrentUser } from './store/slices/userSlice';

// Components
import Header from './components/Layout/Header';
import AuthWrapper from './components/AuthWrapper';
import CommonWrapper from './components/CommonWrapper';

// Pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Categories from './pages/Categories';
import Notifications from './pages/Notifications';
import Statistics from './pages/Statistics';
import NotFound from './pages/NotFound';

function AppContent() { // ← Вынесли логику в отдельный компонент
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.user);
  const hasChecked = useRef(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (hasChecked.current || loading) {
      return;
    }
    
    if (token && !isAuthenticated) {
      hasChecked.current = true;
      dispatch(fetchCurrentUser()).catch(() => {
        // Токен невалидный — удаляем его
        localStorage.removeItem('token');
      });
    }
  }, [dispatch, isAuthenticated, loading]);
  
  return (
    <BrowserRouter>
      <CommonWrapper>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/register" element={<Register />} />
              
              <Route element={<AuthWrapper />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/statistics" element={<Statistics />} /> 
              </Route>
              
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </main>
        </div>
      </CommonWrapper>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;