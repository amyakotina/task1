import React, { useState, useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  createdAt?: string;
}

const Statistics: React.FC = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    productivity: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получаем текущего пользователя
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const userEmail = JSON.parse(currentUser).email;
    
    // Получаем задачи пользователя
    const allTasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    const userTasks: Task[] = allTasks[userEmail] || [];
    
    // Рассчитываем статистику
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter(t => t.status === 'done').length;
    const activeTasks = userTasks.filter(t => t.status === 'todo' || t.status === 'in-progress').length;
    const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const highPriority = userTasks.filter(t => t.priority === 'high').length;
    const mediumPriority = userTasks.filter(t => t.priority === 'medium').length;
    const lowPriority = userTasks.filter(t => t.priority === 'low').length;

    setStats({
      totalTasks,
      activeTasks,
      completedTasks,
      productivity,
      highPriority,
      mediumPriority,
      lowPriority
    });
    
    setLoading(false);
  }, []);

  // Генерируем данные для графика по дням недели
  const getWeeklyData = () => {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    // Если нет задач, возвращаем нулевые значения
    if (stats.totalTasks === 0) {
      return days.map(day => ({ day, height: 10, tasks: 0 }));
    }
    
    // Здесь можно добавить реальную статистику по дням
    // Пока генерируем случайные данные на основе общего количества задач
    return days.map(day => ({
      day,
      height: Math.random() * 100 + 20,
      tasks: Math.floor(Math.random() * stats.totalTasks)
    }));
  };

  const weeklyData = getWeeklyData();

  if (loading) {
    return <div className="text-center mt-5">Загрузка...</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Статистика</h2>
      
      {stats.totalTasks === 0 ? (
        <div className="text-center py-5">
          <h3>Нет данных для статистики</h3>
          <p className="text-muted">Создайте свои первые задачи, чтобы увидеть статистику</p>
          <a href="/tasks" className="btn btn-primary btn-lg">
            Создать задачу
          </a>
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h5 className="card-title">Выполнено задач</h5>
                  <h2>{stats.completedTasks}</h2>
                  <p className="mb-0">из {stats.totalTasks}</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h5 className="card-title">Активных задач</h5>
                  <h2>{stats.activeTasks}</h2>
                  <p className="mb-0">в работе</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <h5 className="card-title">Продуктивность</h5>
                  <h2>{stats.productivity}%</h2>
                  <p className="mb-0">за все время</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-4">Задачи по приоритетам</h5>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Высокий</span>
                      <span>{stats.highPriority}</span>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar bg-danger" 
                        style={{width: `${stats.totalTasks > 0 ? (stats.highPriority / stats.totalTasks) * 100 : 0}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Средний</span>
                      <span>{stats.mediumPriority}</span>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar bg-warning" 
                        style={{width: `${stats.totalTasks > 0 ? (stats.mediumPriority / stats.totalTasks) * 100 : 0}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Низкий</span>
                      <span>{stats.lowPriority}</span>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar bg-info" 
                        style={{width: `${stats.totalTasks > 0 ? (stats.lowPriority / stats.totalTasks) * 100 : 0}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-4">Статус задач</h5>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>К выполнению</span>
                      <span>{stats.totalTasks - stats.completedTasks - stats.activeTasks}</span>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar bg-secondary" 
                        style={{width: `${stats.totalTasks > 0 ? ((stats.totalTasks - stats.completedTasks - stats.activeTasks) / stats.totalTasks) * 100 : 0}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>В процессе</span>
                      <span>{stats.activeTasks}</span>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar bg-primary" 
                        style={{width: `${stats.totalTasks > 0 ? (stats.activeTasks / stats.totalTasks) * 100 : 0}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Готово</span>
                      <span>{stats.completedTasks}</span>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar bg-success" 
                        style={{width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-4">Активность по дням</h5>
                  <div className="d-flex justify-content-around align-items-end" style={{height: '200px'}}>
                    {weeklyData.map((item, i) => (
                      <div key={item.day} className="text-center">
                        <div 
                          className="bg-primary" 
                          style={{
                            width: '40px', 
                            height: `${item.height}px`,
                            marginBottom: '10px',
                            opacity: item.tasks > 0 ? 1 : 0.3
                          }}
                        ></div>
                        <span>{item.day}</span>
                        <br />
                        <small className="text-muted">{item.tasks} зад.</small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Statistics;