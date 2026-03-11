import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface User {
  name: string;
  email: string;
  password: string;
}

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Получаем список пользователей
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Ищем пользователя с таким email и паролем
    const user = users.find((u: User) => u.email === email && u.password === password);
    
    if (user) {
      // Сохраняем текущего пользователя
      localStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email }));
      localStorage.setItem('isAuth', 'true');
      navigate('/profile');
    } else {
      setError('Неверный email или пароль');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Вход в аккаунт</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Пароль</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button type="submit" className="btn btn-primary w-100 mb-3">
                  Войти
                </button>
                
                <p className="text-center mb-0">
                  Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;