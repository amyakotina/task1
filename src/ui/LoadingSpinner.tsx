import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75" style={{ zIndex: 9999 }}>
      <div className="text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-2 text-muted">Загрузка...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;