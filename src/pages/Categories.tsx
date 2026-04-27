import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchCategories, createCategory, deleteCategory, updateCategory } from '../store/slices/categoriesSlice';
import { fetchTasks } from '../store/slices/tasksSlice';

const Categories: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state) => state.categories);
  const { tasks } = useAppSelector((state) => state.tasks);
  const [showForm, setShowForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: number; name: string } | null>(null);
  
  const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'];

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchTasks());
  }, [dispatch]);

  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    await dispatch(createCategory({ name: newCategoryName, color: getRandomColor() })).unwrap();
    setNewCategoryName('');
    setShowForm(false);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) return;
    
    await dispatch(updateCategory({ categoryId: editingCategory.id, name: editingCategory.name })).unwrap();
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    const categoryTasks = tasks.filter(t => t.categoryId === categoryId);
    const message = categoryTasks.length > 0
      ? `В категории "${categoryName}" есть ${categoryTasks.length} задач(и). При удалении категории задачи останутся без категории. Удалить?`
      : `Вы уверены, что хотите удалить категорию "${categoryName}"?`;
    
    if (window.confirm(message)) {
      await dispatch(deleteCategory(categoryId)).unwrap();
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-2">Загрузка категорий...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🏷️ Категории задач</h2>
        <button 
          className="btn btn-primary btn-lg px-4"
          onClick={() => setShowForm(!showForm)}
          style={{ borderRadius: '12px' }}
        >
          {showForm ? '✖ Отмена' : '+ Новая категория'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 shadow-sm border-0" style={{ borderRadius: '16px' }}>
          <div className="card-body p-4">
            <h5 className="card-title mb-3">✨ Создание новой категории</h5>
            <form onSubmit={handleCreateCategory}>
              <div className="mb-3">
                <label className="form-label fw-bold">Название категории</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Например: Работа, Личное, Учеба..."
                  required
                  autoFocus
                  style={{ borderRadius: '12px' }}
                />
              </div>
              <button type="submit" className="btn btn-success btn-lg px-5" style={{ borderRadius: '12px' }}>
                ✅ Создать категорию
              </button>
            </form>
          </div>
        </div>
      )}

      {editingCategory && (
        <div className="card mb-4 shadow-sm border-0" style={{ borderRadius: '16px', backgroundColor: '#fff3cd' }}>
          <div className="card-body p-4">
            <h5 className="card-title mb-3">✏️ Редактирование категории</h5>
            <form onSubmit={handleUpdateCategory}>
              <div className="mb-3">
                <label className="form-label fw-bold">Название категории</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  required
                  style={{ borderRadius: '12px' }}
                />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">💾 Сохранить</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingCategory(null)}>
                  ❌ Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-5">
          <div className="display-1 mb-3">🏷️</div>
          <h3 className="mb-3">У вас пока нет категорий</h3>
          <p className="text-muted mb-4">Создайте категории для удобной организации задач</p>
          <button className="btn btn-primary btn-lg px-5" onClick={() => setShowForm(true)} style={{ borderRadius: '12px' }}>
            + Создать категорию
          </button>
        </div>
      ) : (
        <div className="row">
          {categories.map(category => {
            const categoryTasks = tasks.filter(t => t.categoryId === category.id);
            return (
              <div key={category.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '16px', transition: 'transform 0.2s' }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div 
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: category.color,
                          borderRadius: '12px',
                          marginRight: '15px'
                        }}
                      ></div>
                      <h5 className="card-title mb-0 flex-grow-1">{category.name}</h5>
                      <span className="badge bg-secondary rounded-pill px-3 py-2">
                        {categoryTasks.length} задач
                      </span>
                    </div>
                    
                    <div className="mt-3 d-flex gap-2">
                      <button
                        className="btn btn-outline-primary flex-grow-1"
                        onClick={() => setEditingCategory({ id: category.id, name: category.name })}
                        style={{ borderRadius: '10px' }}
                      >
                        ✏️ Редактировать
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        style={{ borderRadius: '10px' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Статистика */}
      {categories.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card bg-gradient-primary text-white border-0" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body p-4">
                <h6 className="mb-3">📊 Статистика категорий</h6>
                <div className="row text-center">
                  <div className="col-4">
                    <h3 className="mb-0">{categories.length}</h3>
                    <small>Всего категорий</small>
                  </div>
                  <div className="col-4">
                    <h3 className="mb-0">{categories.filter(c => tasks.filter(t => t.categoryId === c.id).length > 0).length}</h3>
                    <small>Используемых</small>
                  </div>
                  <div className="col-4">
                    <h3 className="mb-0">{categories.reduce((sum, c) => sum + tasks.filter(t => t.categoryId === c.id).length, 0)}</h3>
                    <small>Задач в категориях</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;