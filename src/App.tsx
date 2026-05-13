import { BrowserRouter, Route, Routes } from "react-router-dom";

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Categories from './pages/Categories';
import Notifications from './pages/Notifications';
import Statistics from './pages/Statistics';
import NotFound from './pages/NotFound';

import Header from './components/Layout/Header';
import AuthWrapper from './components/AuthWrapper';
import CommonWrapper from './components/CommonWrapper';



function AppRouter() {
  return (
    <BrowserRouter>
      <CommonWrapper>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1">
            <AuthWrapper>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/statistics" element={<Statistics />} /> 
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthWrapper>
          </main>
        </div>
      </CommonWrapper>
    </BrowserRouter>
  );
}

export default AppRouter;