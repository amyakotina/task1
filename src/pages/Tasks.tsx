import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { fetchTasks, createTask, updateTask, deleteTask, patchTask } from '../store/slices/tasksSlice';

const Tasks: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const { tasks, loading } = useAppSelector((state) => state.tasks);
  
  const [showForm, setShowForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  
  const hasFetched = useRef(false);

  useEffect(() => {
    if (user && !hasFetched.current) {
      hasFetched.current = true;
      console.log('GET /api/tasks - запрос на получение задач (1 раз)');
      dispatch(fetchTasks(user.email));
    }
  }, [dispatch, user]); 

  // POST запрос - создание задачи
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTaskTitle.trim()) return;

    console.log(`POST /api/tasks - создание задачи "${newTaskTitle}"`);
    
    await dispatch(createTask({
      task: {
        title: newTaskTitle,
        status: 'todo',
        priority: newTaskPriority,
        userId: user.email,
      },
      userEmail: user.email,
    })).unwrap();

    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setShowForm(false);
  };

  // PUT запрос - обновление статуса задачи
  const handleStatusChange = async (taskId: number, currentStatus: string) => {
    if (!user) return;

    // Находим текущую задачу
    const currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask) return;

    let newStatus: 'todo' | 'in-progress' | 'done';
    if (currentStatus === 'todo') newStatus = 'in-progress';
    else if (currentStatus === 'in-progress') newStatus = 'done';
    else newStatus = 'todo';

    // PUT - отправляем ВСЕ поля задачи (полное обновление)
    const fullUpdatedTask = {
      ...currentTask,      // берем все текущие поля
      status: newStatus    // меняем только статус
    };

    console.log(`PUT /api/tasks/${taskId}`);
    
    await dispatch(updateTask({
      taskId,
      fullTask: fullUpdatedTask,  // отправляем ВЕСЬ объект
      userEmail: user.email,
    })).unwrap();
  };
  // PATCH запрос - частичное обновление приоритета
  const handlePriorityChange = async (taskId: number, newPriority: 'high' | 'medium' | 'low') => {
    if (!user) return;

    console.log(`PATCH /api/tasks/${taskId}`, { priority: newPriority });
    
    // PATCH - отправляем ТОЛЬКО изменяемое поле
    await dispatch(patchTask({
      taskId,
      updates: { priority: newPriority },  // ТОЛЬКО приоритет
      userEmail: user.email,
    })).unwrap();
  };


  // DELETE запрос - удаление задачи
  const handleDeleteTask = async (taskId: number) => {
    if (!user) return;
    if (!window.confirm('Вы уверены, что хотите удалить задачу?')) return;

    console.log(`DELETE /api/tasks/${taskId} - удаление задачи`);
    
    await dispatch(deleteTask({
      taskId,
      userEmail: user.email,
    })).unwrap();
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; text: string }> = {
      'todo': { class: 'bg-secondary', text: 'К выполнению' },
      'in-progress': { class: 'bg-primary', text: 'В процессе' },
      'done': { class: 'bg-success', text: 'Готово' }
    };
    return badges[status] || badges.todo;
  };

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, { class: string; text: string }> = {
      'high': { class: 'bg-danger', text: 'Высокий' },
      'medium': { class: 'bg-warning', text: 'Средний' },
      'low': { class: 'bg-info', text: 'Низкий' }
    };
    return badges[priority] || badges.medium;
  };

  if (loading) {
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
        <h2>Мои задачи</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✖ Отмена' : '+ Новая задача'}
        </button>
      </div>

      {/* Форма создания задачи - POST запрос */}
      {showForm && (
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">➕ Создание новой задачи</h5>
            <form onSubmit={handleCreateTask}>
              <div className="mb-3">
                <label className="form-label">Название задачи</label>
                <input
                  type="text"
                  className="form-control"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Введите название задачи"
                  required
                  autoFocus
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Приоритет</label>
                <select
                  className="form-select"
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                >
                  <option value="low">🟢 Низкий</option>
                  <option value="medium">🟡 Средний</option>
                  <option value="high">🔴 Высокий</option>
                </select>
              </div>
              
              <button type="submit" className="btn btn-success">
                ✅ Создать задачу
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Список задач */}
      {tasks.length === 0 ? (
        <div className="text-center py-5">
          <div className="display-1 mb-3">📋</div>
          <h3>У вас пока нет задач</h3>
          <p className="text-muted">Создайте свою первую задачу</p>
          <button className="btn btn-primary btn-lg" onClick={() => setShowForm(true)}>
            + Создать задачу
          </button>
        </div>
      ) : (
        <div className="row">
          {tasks.map((task) => {
            const status = getStatusBadge(task.status);
            const priority = getPriorityBadge(task.priority);
            
            return (
              <div key={task.id} className="col-md-6 mb-3">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title mb-0">{task.title}</h5>
                      <div className="dropdown">
                        <button 
                          className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          {priority.text}
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <button 
                              className="dropdown-item" 
                              onClick={() => handlePriorityChange(task.id, 'low')}
                            >
                              🟢 Низкий
                            </button>
                          </li>
                          <li>
                            <button 
                              className="dropdown-item" 
                              onClick={() => handlePriorityChange(task.id, 'medium')}
                            >
                              🟡 Средний
                            </button>
                          </li>
                          <li>
                            <button 
                              className="dropdown-item" 
                              onClick={() => handlePriorityChange(task.id, 'high')}
                            >
                              🔴 Высокий
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-3 d-flex justify-content-between align-items-center">
                      {/* PUT запрос - изменение статуса */}
                      <button
                        className={`btn btn-sm ${status.class} text-white`}
                        onClick={() => handleStatusChange(task.id, task.status)}
                        title="Изменить статус"
                      >
                        {status.text}
                      </button>
                      
                      {/* DELETE запрос - удаление */}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteTask(task.id)}
                        title="Удалить задачу"
                      >
                        🗑️ Удалить
                      </button>
                    </div>
                    
                    <div className="mt-2">
                      <small className="text-muted">
                        Создана: {new Date(task.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Статистика */}
      {tasks.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="mb-2">📊 Статистика:</h6>
                <div className="d-flex gap-3">
                  <span>Всего: {tasks.length}</span>
                  <span className="text-success">
                    ✓ Выполнено: {tasks.filter(t => t.status === 'done').length}
                  </span>
                  <span className="text-primary">
                    ⟳ В процессе: {tasks.filter(t => t.status === 'in-progress').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;