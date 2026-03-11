import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface User {
  name: string;
  email: string;
  password: string;
}

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!name || !email || !password || !confirmPassword) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    // Получаем существующих пользователей или создаем пустой массив
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Проверяем, не занят ли email
    const userExists = existingUsers.some((u: User) => u.email === email);
    
    if (userExists) {
      setError('Пользователь с таким email уже существует');
      return;
    }

    // Создаем нового пользователя
    const newUser = { name, email, password };
    existingUsers.push(newUser);
    
    // Сохраняем в localStorage
    localStorage.setItem('users', JSON.stringify(existingUsers));
    
    // Инициализируем пустые данные для нового пользователя
    const tasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    const categories = JSON.parse(localStorage.getItem('categories') || '{}');
    const notifications = JSON.parse(localStorage.getItem('notifications') || '{}');
    
    tasks[email] = [];
    categories[email] = [];
    notifications[email] = [];
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Сразу авторизуем пользователя
    localStorage.setItem('currentUser', JSON.stringify({ name, email }));
    localStorage.setItem('isAuth', 'true');
    
    // Перенаправляем в личный кабинет
    navigate('/profile');
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Регистрация</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Имя</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Введите ваше имя"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Введите email"
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
                    placeholder="Минимум 6 символов"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Подтверждение пароля</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Повторите пароль"
                    required
                  />
                </div>
                
                <button type="submit" className="btn btn-primary w-100 mb-3">
                  Зарегистрироваться
                </button>
                
                <p className="text-center mb-0">
                  Уже есть аккаунт? <Link to="/auth">Войти</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;