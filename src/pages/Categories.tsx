import React, { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  color: string;
  count: number;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получаем текущего пользователя
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const userEmail = JSON.parse(currentUser).email;
    
    // Получаем категории конкретного пользователя
    const allCategories = JSON.parse(localStorage.getItem('categories') || '{}');
    const userCategories = allCategories[userEmail] || [];
    
    setCategories(userCategories);
    setLoading(false);
  }, []);

  const addCategory = () => {
    const name = prompt('Введите название категории:');
    if (!name) return;

    const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const userEmail = JSON.parse(currentUser).email;
    
    // Создаем новую категорию
    const newCategory: Category = {
      id: Date.now(),
      name,
      color: randomColor,
      count: 0
    };

    // Получаем все категории
    const allCategories = JSON.parse(localStorage.getItem('categories') || '{}');
    
    // Добавляем категорию для конкретного пользователя
    if (!allCategories[userEmail]) {
      allCategories[userEmail] = [];
    }
    allCategories[userEmail].push(newCategory);
    
    // Сохраняем
    localStorage.setItem('categories', JSON.stringify(allCategories));
    setCategories(allCategories[userEmail]);
  };

  if (loading) {
    return <div className="text-center mt-5">Загрузка...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Категории</h2>
        <button className="btn btn-primary" onClick={addCategory}>
          + Новая категория
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-5">
          <h3>У вас пока нет категорий</h3>
          <p className="text-muted">Создайте свою первую категорию для организации задач</p>
          <button className="btn btn-primary btn-lg" onClick={addCategory}>
            Создать категорию
          </button>
        </div>
      ) : (
        <div className="row">
          {categories.map(category => (
            <div key={category.id} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div 
                      style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: category.color,
                        borderRadius: '5px',
                        marginRight: '15px'
                      }}
                    ></div>
                    <h5 className="card-title mb-0 flex-grow-1">{category.name}</h5>
                    <span className="badge bg-secondary">{category.count} задач</span>
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

export default Categories;