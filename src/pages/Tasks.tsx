import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { fetchTasks, createTask, updateTask, deleteTask, patchTask } from '../store/slices/tasksSlice';
import { TaskStatus, TaskPriority } from '../types';

const Tasks: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const { tasks, loading } = useAppSelector((state) => state.tasks);
  const { categories } = useAppSelector((state) => state.categories);
  
  const [showForm, setShowForm] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskCategoryId, setNewTaskCategoryId] = useState<number | null>(null);
  
  const hasFetched = useRef<boolean>(false);

  useEffect(() => {
    if (user && !hasFetched.current) {
      hasFetched.current = true;
      dispatch(fetchTasks());
      // Удалены dispatch(fetchCategories()) и dispatch(fetchNotifications())
      //因为它们 уже загружены в AuthWrapper
    }
  }, [dispatch, user]);

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!user || !newTaskTitle.trim()) return;
    
    await dispatch(createTask({
      title: newTaskTitle,
      priority: newTaskPriority,
      categoryId: newTaskCategoryId || undefined
    })).unwrap();

    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setNewTaskCategoryId(null);
    setShowForm(false);
  };

  const handleStatusChange = async (taskId: number, currentStatus: TaskStatus): Promise<void> => {
    let newStatus: TaskStatus;
    if (currentStatus === 'todo') newStatus = 'in-progress';
    else if (currentStatus === 'in-progress') newStatus = 'done';
    else newStatus = 'todo';

    await dispatch(updateTask({ taskId, status: newStatus })).unwrap();
  };

  const handlePriorityChange = async (taskId: number, newPriority: TaskPriority): Promise<void> => {
    await dispatch(patchTask({ taskId, priority: newPriority })).unwrap();
  };

  const handleDeleteTask = async (taskId: number): Promise<void> => {
    if (!window.confirm('Вы уверены, что хотите удалить задачу?')) return;
    await dispatch(deleteTask(taskId)).unwrap();
  };

  const getStatusBadge = (status: TaskStatus): { class: string; text: string } => {
    const badges: Record<TaskStatus, { class: string; text: string }> = {
      'todo': { class: 'bg-secondary', text: '📋 К выполнению' },
      'in-progress': { class: 'bg-primary', text: '🔄 В процессе' },
      'done': { class: 'bg-success', text: '✅ Готово' }
    };
    return badges[status];
  };

  const getPriorityBadge = (priority: TaskPriority): { class: string; text: string } => {
    const badges: Record<TaskPriority, { class: string; text: string }> = {
      'high': { class: 'bg-danger', text: '🔴 Высокий' },
      'medium': { class: 'bg-warning', text: '🟡 Средний' },
      'low': { class: 'bg-info', text: '🟢 Низкий' }
    };
    return badges[priority];
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-2">Загрузка задач...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>✨ Мои задачи</h2>
        <button 
          className="btn btn-primary btn-lg px-4"
          onClick={() => setShowForm(!showForm)}
          style={{ borderRadius: '12px', fontWeight: 'bold' }}
        >
          {showForm ? '✖ Отмена' : '+ Новая задача'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 shadow-lg border-0" style={{ borderRadius: '20px' }}>
          <div className="card-body p-4">
            <h5 className="card-title mb-3" style={{ fontSize: '1.5rem' }}>✨ Создание новой задачи</h5>
            <form onSubmit={handleCreateTask}>
              <div className="mb-3">
                <label className="form-label fw-bold">Название задачи</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Например: Изучить React"
                  required
                  autoFocus
                  style={{ borderRadius: '12px' }}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Приоритет</label>
                <select
                  className="form-select form-select-lg"
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                  style={{ borderRadius: '12px' }}
                >
                  <option value="low">🟢 Низкий</option>
                  <option value="medium">🟡 Средний</option>
                  <option value="high">🔴 Высокий</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Категория (опционально)</label>
                <select
                  className="form-select form-select-lg"
                  value={newTaskCategoryId || ''}
                  onChange={(e) => setNewTaskCategoryId(e.target.value ? Number(e.target.value) : null)}
                  style={{ borderRadius: '12px' }}
                >
                  <option value="">Без категории</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <button type="submit" className="btn btn-success btn-lg px-5" style={{ borderRadius: '12px' }}>
                ✅ Создать задачу
              </button>
            </form>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-5">
          <div className="display-1 mb-3">📋</div>
          <h3 className="mb-3">У вас пока нет задач</h3>
          <p className="text-muted mb-4">Создайте свою первую задачу и начните управлять временем</p>
          <button className="btn btn-primary btn-lg px-5" onClick={() => setShowForm(true)} style={{ borderRadius: '12px' }}>
            + Создать задачу
          </button>
        </div>
      ) : (
        <div className="row">
          {tasks.map((task) => {
            const status = getStatusBadge(task.status);
            const priority = getPriorityBadge(task.priority);
            const category = categories.find(c => c.id === task.categoryId);
            
            return (
              <div key={task.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '16px', transition: 'transform 0.2s' }}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title mb-0 fw-bold" style={{ fontSize: '1.2rem' }}>{task.title}</h5>
                      <span className={`badge ${priority.class} px-3 py-2`} style={{ fontSize: '0.8rem', borderRadius: '20px' }}>
                        {priority.text}
                      </span>
                    </div>
                    
                    {category && (
                      <div className="mb-2">
                        <span 
                          className="badge px-2 py-1" 
                          style={{ backgroundColor: category.color, color: 'white', borderRadius: '8px' }}
                        >
                          📁 {category.name}
                        </span>
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <button
                        className={`btn ${status.class} text-white w-100 mb-2`}
                        onClick={() => handleStatusChange(task.id, task.status)}
                        style={{ borderRadius: '10px', padding: '8px' }}
                        title="Изменить статус"
                      >
                        {status.text}
                      </button>
                      
                      <div className="d-flex gap-2 mb-2">
                        <button
                          className="btn btn-outline-danger flex-grow-1"
                          onClick={() => handlePriorityChange(task.id, 'high')}
                          style={{ borderRadius: '10px' }}
                          title="Высокий приоритет"
                        >
                          🔴 Высокий
                        </button>
                        <button
                          className="btn btn-outline-warning flex-grow-1"
                          onClick={() => handlePriorityChange(task.id, 'medium')}
                          style={{ borderRadius: '10px' }}
                          title="Средний приоритет"
                        >
                          🟡 Средний
                        </button>
                        <button
                          className="btn btn-outline-info flex-grow-1"
                          onClick={() => handlePriorityChange(task.id, 'low')}
                          style={{ borderRadius: '10px' }}
                          title="Низкий приоритет"
                        >
                          🟢 Низкий
                        </button>
                      </div>
                      
                      <button
                        className="btn btn-outline-danger w-100"
                        onClick={() => handleDeleteTask(task.id)}
                        style={{ borderRadius: '10px' }}
                        title="Удалить задачу"
                      >
                        🗑️ Удалить
                      </button>
                    </div>
                    
                    <div className="mt-3 text-center">
                      <small className="text-muted">
                        {task.status === 'todo' && '⏳ Ожидает выполнения'}
                        {task.status === 'in-progress' && '⚡ В работе'}
                        {task.status === 'done' && '🎉 Выполнено!'}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Tasks;