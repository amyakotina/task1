import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchTasks } from '../store/slices/tasksSlice';
import { TaskStatus } from '../types';

const Statistics: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector((state) => state.tasks);
  const hasFetched = useRef<boolean>(false);

  useEffect(() => {
    if (!hasFetched.current && tasks.length === 0) {
      hasFetched.current = true;
      dispatch(fetchTasks());
    }
  }, [dispatch, tasks.length]);

  const statusStats: Record<TaskStatus, number> = {
    todo: tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  const completionRate: number = tasks.length > 0 
    ? Math.round((statusStats.done / tasks.length) * 100) 
    : 0;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">📊 Статистика</h2>

      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-center bg-primary text-white border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <div className="card-body">
              <h3 className="mb-0">{tasks.length}</h3>
              <small>Всего задач</small>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center bg-success text-white border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <div className="card-body">
              <h3 className="mb-0">{statusStats.done}</h3>
              <small>Выполнено</small>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center bg-warning text-white border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <div className="card-body">
              <h3 className="mb-0">{statusStats['in-progress']}</h3>
              <small>В процессе</small>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center bg-secondary text-white border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <div className="card-body">
              <h3 className="mb-0">{statusStats.todo}</h3>
              <small>К выполнению</small>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
        <div className="card-body p-4">
          <h5 className="card-title mb-3">📈 Общий прогресс</h5>
          
          <div className="progress mb-3" style={{ height: '35px', borderRadius: '20px' }}>
            <div 
              className="progress-bar bg-success" 
              style={{ width: `${completionRate}%`, fontSize: '1rem', fontWeight: 'bold' }}
            >
              {completionRate}% выполнено
            </div>
          </div>
          
          <div className="d-flex justify-content-between text-muted">
            <div className="text-center">
              <div className="fw-bold text-secondary">📋 {statusStats.todo}</div>
              <small>К выполнению</small>
            </div>
            <div className="text-center">
              <div className="fw-bold text-warning">🔄 {statusStats['in-progress']}</div>
              <small>В процессе</small>
            </div>
            <div className="text-center">
              <div className="fw-bold text-success">✅ {statusStats.done}</div>
              <small>Выполнено</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;