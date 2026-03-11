import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="container mt-5">
      <div className="text-center">
        <h1 className="display-4 mb-4">Добро пожаловать в TaskManager</h1>
        <p className="lead mb-4">
          Управляйте своими задачами эффективно и просто
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <Link to="/auth" className="btn btn-primary btn-lg">
            Войти
          </Link>
          <Link to="/register" className="btn btn-outline-primary btn-lg">
            Зарегистрироваться
          </Link>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h5>Создавайте задачи</h5>
              <p>Легко добавляйте и организуйте свои задачи</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h5>Отслеживайте прогресс</h5>
              <p>Следите за выполнением задач</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h5>Достигайте целей</h5>
              <p>Выполняйте задачи вовремя</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;