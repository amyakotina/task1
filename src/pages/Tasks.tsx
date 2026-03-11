import React, { useState, useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  categoryId?: number;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получаем текущего пользователя
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const userEmail = JSON.parse(currentUser).email;
    
    // Получаем задачи конкретного пользователя
    const allTasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    const userTasks = allTasks[userEmail] || [];
    
    setTasks(userTasks);
    setLoading(false);
  }, []);

  const addTask = () => {
    const title = prompt('Введите название задачи:');
    if (!title) return;

    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const userEmail = JSON.parse(currentUser).email;
    
    // Создаем новую задачу
    const newTask: Task = {
      id: Date.now(),
      title,
      status: 'todo',
      priority: 'medium'
    };

    // Получаем все задачи
    const allTasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    
    // Добавляем задачу для конкретного пользователя
    if (!allTasks[userEmail]) {
      allTasks[userEmail] = [];
    }
    allTasks[userEmail].push(newTask);
    
    // Сохраняем
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    setTasks(allTasks[userEmail]);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'todo': 'bg-secondary',
      'in-progress': 'bg-primary',
      'done': 'bg-success'
    };
    return badges[status as keyof typeof badges] || 'bg-secondary';
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      'high': 'bg-danger',
      'medium': 'bg-warning',
      'low': 'bg-info'
    };
    return badges[priority as keyof typeof badges] || 'bg-secondary';
  };

  if (loading) {
    return <div className="text-center mt-5">Загрузка...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Мои задачи</h2>
        <button className="btn btn-primary" onClick={addTask}>
          + Новая задача
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-5">
          <h3>У вас пока нет задач</h3>
          <p className="text-muted">Создайте свою первую задачу и начните управлять временем</p>
          <button className="btn btn-primary btn-lg" onClick={addTask}>
            Создать задачу
          </button>
        </div>
      ) : (
        <div className="row">
          {tasks.map(task => (
            <div key={task.id} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{task.title}</h5>
                  <div className="mt-2">
                    <span className={`badge ${getStatusBadge(task.status)} me-2`}>
                      {task.status === 'todo' ? 'К выполнению' : 
                       task.status === 'in-progress' ? 'В процессе' : 'Готово'}
                    </span>
                    <span className={`badge ${getPriorityBadge(task.priority)}`}>
                      {task.priority === 'high' ? 'Высокий' : 
                       task.priority === 'medium' ? 'Средний' : 'Низкий'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;