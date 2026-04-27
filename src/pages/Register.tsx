// src/pages/Register.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { register } from '../store/slices/userSlice';
import { setError } from '../store/slices/settingsSlice';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state) => state.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      dispatch(setError({ message: 'Пароли не совпадают', status: 400 }));
      return;
    }
    
    if (password.length < 6) {
      dispatch(setError({ message: 'Пароль должен быть минимум 6 символов', status: 400 }));
      return;
    }
    
    try {
      await dispatch(register({ name, email, password })).unwrap();
      navigate('/profile');
    } catch (err) {
      const errorMessage = err && typeof err === 'object' && 'message' in err 
        ? String(err.message) 
        : 'Ошибка регистрации';
      dispatch(setError({ message: errorMessage, status: 409 }));
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow border-0">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <div className="display-1">📝</div>
                <h2 className="mt-2">Регистрация</h2>
                <p className="text-muted">Создайте новый аккаунт</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Имя</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
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
                    className="form-control form-control-lg"
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
                    className="form-control form-control-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="form-label">Подтверждение пароля</label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Повторите пароль"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
                
                <p className="text-center mb-0">
                  Уже есть аккаунт?{' '}
                  <Link to="/auth" className="text-decoration-none">
                    Войти
                  </Link>
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