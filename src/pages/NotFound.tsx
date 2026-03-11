import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="container mt-5 text-center">
      <h1 className="display-1">404</h1>
      <h2 className="mb-4">Страница не найдена</h2>
      <p className="lead mb-4">
        Извините, запрашиваемая страница не существует или была перемещена.
      </p>
      <Link to="/" className="btn btn-primary btn-lg">
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFound;