const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;
const SECRET_KEY = 'your-secret-key-2024';

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Явная обработка OPTIONS запросов (preflight)
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Логирование всех запросов (для отладки)
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}${req.method === 'OPTIONS' ? ' (preflight)' : ''}`);
  next();
});

// Middleware
app.use(express.json());

let users = []; // Массив для хранения пользователей
let tasks = []; // Массив для хранения задач
let categories = []; // Массив для хранения категорий
let notifications = []; // Массив для хранения уведомлений
let nextTaskId = 1; // Счетчик для генерации уникальных ID задач 
let nextCategoryId = 1; // Счетчик для генерации уникальных ID категорий
let nextNotificationId = 1; // Счетчик для генерации уникальных ID уведомлений


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log(`🔐 Проверка токена: ${token ? 'токен есть' : 'токена нет'}`);
  
  if (!token) {
    return res.status(401).json({ message: 'Токен не предоставлен', status: 401 });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.log(`❌ Ошибка верификации токена: ${err.message}`);
      return res.status(403).json({ message: 'Недействительный токен', status: 403 });
    }
    req.user = user;
    next();
  });
};

//АВТОРИЗАЦИЯ

// Регистрация (POST /api/auth/register)
app.post('/api/auth/register', async (req, res) => {
  console.log('📝 POST /api/auth/register');
  const { name, email, password } = req.body; //Получаем данные от фронтенда
  const existingUser = users.find(u => u.email === email); //Проверяем, нет ли уже такого пользователя

  if (existingUser) {
    return res.status(409).json({ message: 'Пользователь с таким email уже существует', status: 409 });
  }

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Все поля обязательны для заполнения', status: 400 });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Пароль должен быть минимум 6 символов', status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10); //Хешируем пароль

  const newUser = { //Создаём пользователя
    id: Date.now().toString(),
    name,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  const token = jwt.sign( //Создаем токен
    { id: newUser.id, email: newUser.email },
    SECRET_KEY,
    { expiresIn: '7d' }
  );

  res.status(201).json({ //Отправляем токен на фронтенд
    status: 201,
    message: 'Регистрация успешна',
    user: { id: newUser.id, name: newUser.name, email: newUser.email, createdAt: newUser.createdAt },
    token
  });
});

// Вход (POST /api/auth/login)
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 POST /api/auth/login');
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Неверный email или пароль', status: 401 });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Неверный email или пароль', status: 401 });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '7d' });

  res.status(200).json({
    status: 200,
    message: 'Вход выполнен успешно',
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    token
  });
});

// Выход (POST /api/auth/logout) - требует токен
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  console.log('🚪 POST /api/auth/logout');
  res.status(200).json({ message: 'Выход выполнен успешно', status: 200 });
});

// ПОЛЬЗОВАТЕЛИ

// Получение информации о текущем пользователе (GET /api/users/me)
app.get('/api/users/me', authenticateToken, (req, res) => {
  console.log('👤 GET /api/users/me');
  const user = users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден', status: 404 });
  }

  const userTasks = tasks.filter(t => t.userId === user.id);
  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter(t => t.status === 'done').length;
  const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  res.status(200).json({
    status: 200,
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    stats: { totalTasks, completedTasks, productivity }
  });
});

//ЗАДАЧИ

// Получение всех задач пользователя (GET /api/tasks)
app.get('/api/tasks', authenticateToken, (req, res) => {
  console.log('📋 GET /api/tasks');
  const userTasks = tasks.filter(t => t.userId === req.user.id);
  res.status(200).json({
    status: 200,
    tasks: userTasks
  });
});

// Создание задачи (POST /api/tasks)
app.post('/api/tasks', authenticateToken, (req, res) => {
  console.log('➕ POST /api/tasks');
  const { title, priority, categoryId } = req.body;

  const newTask = {
    id: nextTaskId++,
    title,
    status: 'todo',
    priority: priority || 'medium',
    categoryId: categoryId || null,
    userId: req.user.id,
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);

  const newNotification = {
    id: nextNotificationId++,
    type: 'info',
    message: `Создана новая задача: "${title}"`,
    time: new Date().toISOString(),
    read: false,
    userId: req.user.id
  };
  notifications.push(newNotification);

  res.status(201).json({
    status: 201,
    message: 'Задача создана',
    task: newTask
  });
});

// Полное обновление задачи (PUT /api/tasks/:id)
app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  console.log('✏️ PUT /api/tasks/:id');
  const taskId = parseInt(req.params.id);
  const { title, status, priority, categoryId } = req.body;

  const taskIndex = tasks.findIndex(t => t.id === taskId && t.userId === req.user.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Задача не найдена', status: 404 });
  }

  const oldStatus = tasks[taskIndex].status;
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title: title || tasks[taskIndex].title,
    status: status || tasks[taskIndex].status,
    priority: priority || tasks[taskIndex].priority,
    categoryId: categoryId !== undefined ? categoryId : tasks[taskIndex].categoryId
  };

  if (status && oldStatus !== status) {
    let statusMessage = '';
    if (status === 'done') statusMessage = 'Выполнена!';
    else if (status === 'in-progress') statusMessage = 'В работе';
    else statusMessage = 'Возвращена к выполнению';
    
    const newNotification = {
      id: nextNotificationId++,
      type: status === 'done' ? 'success' : 'info',
      message: `Задача "${tasks[taskIndex].title}" ${statusMessage}`,
      time: new Date().toISOString(),
      read: false,
      userId: req.user.id
    };
    notifications.push(newNotification);
  }

  res.status(200).json({
    status: 200,
    message: 'Задача обновлена',
    task: tasks[taskIndex]
  });
});

// Частичное обновление задачи (PATCH /api/tasks/:id)
app.patch('/api/tasks/:id', authenticateToken, (req, res) => {
  console.log('🔧 PATCH /api/tasks/:id');
  const taskId = parseInt(req.params.id);
  const updates = req.body;

  const taskIndex = tasks.findIndex(t => t.id === taskId && t.userId === req.user.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Задача не найдена', status: 404 });
  }

  tasks[taskIndex] = { ...tasks[taskIndex], ...updates };

  res.status(200).json({
    status: 200,
    message: 'Задача частично обновлена',
    task: tasks[taskIndex],
    updatedFields: Object.keys(updates)
  });
});

// Удаление задачи (DELETE /api/tasks/:id)
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  console.log('🗑️ DELETE /api/tasks/:id');
  const taskId = parseInt(req.params.id);
  
  const taskIndex = tasks.findIndex(t => t.id === taskId && t.userId === req.user.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Задача не найдена', status: 404 });
  }

  const deletedTask = tasks[taskIndex];
  tasks.splice(taskIndex, 1);

  const newNotification = {
    id: nextNotificationId++,
    type: 'warning',
    message: `Задача "${deletedTask.title}" была удалена`,
    time: new Date().toISOString(),
    read: false,
    userId: req.user.id
  };
  notifications.push(newNotification);

  res.status(204).send();
});

// ========== КАТЕГОРИИ (ТРЕБУЮТ ТОКЕН) ==========

// Получение всех категорий пользователя (GET /api/categories)
app.get('/api/categories', authenticateToken, (req, res) => {
  console.log('📁 GET /api/categories');
  const userCategories = categories.filter(c => c.userId === req.user.id);
  
  const userTasks = tasks.filter(t => t.userId === req.user.id);
  const categoriesWithCount = userCategories.map(category => ({
    ...category,
    count: userTasks.filter(t => t.categoryId === category.id).length
  }));
  
  res.status(200).json({
    status: 200,
    categories: categoriesWithCount
  });
});

// Создание категории (POST /api/categories)
app.post('/api/categories', authenticateToken, (req, res) => {
  console.log('➕ POST /api/categories');
  const { name, color } = req.body;

  const newCategory = {
    id: nextCategoryId++,
    name,
    color: color || '#6c757d',
    userId: req.user.id
  };
  categories.push(newCategory);

  res.status(201).json({
    status: 201,
    message: 'Категория создана',
    category: { ...newCategory, count: 0 }
  });
});

// Обновление категории (PUT /api/categories/:id)
app.put('/api/categories/:id', authenticateToken, (req, res) => {
  console.log('✏️ PUT /api/categories/:id');
  const categoryId = parseInt(req.params.id);
  const { name, color } = req.body;

  const categoryIndex = categories.findIndex(c => c.id === categoryId && c.userId === req.user.id);
  
  if (categoryIndex === -1) {
    return res.status(404).json({ message: 'Категория не найдена', status: 404 });
  }

  categories[categoryIndex] = {
    ...categories[categoryIndex],
    name: name || categories[categoryIndex].name,
    color: color || categories[categoryIndex].color
  };

  res.status(200).json({
    status: 200,
    message: 'Категория обновлена',
    category: categories[categoryIndex]
  });
});

// Удаление категории (DELETE /api/categories/:id)
app.delete('/api/categories/:id', authenticateToken, (req, res) => {
  console.log('🗑️ DELETE /api/categories/:id');
  const categoryId = parseInt(req.params.id);
  
  const categoryIndex = categories.findIndex(c => c.id === categoryId && c.userId === req.user.id);
  
  if (categoryIndex === -1) {
    return res.status(404).json({ message: 'Категория не найдена', status: 404 });
  }

  tasks.forEach(task => {
    if (task.categoryId === categoryId && task.userId === req.user.id) {
      task.categoryId = null;
    }
  });

  categories.splice(categoryIndex, 1);

  res.status(204).send();
});

//УВЕДОМЛЕНИЯ

// Получение всех уведомлений пользователя (GET /api/notifications)
app.get('/api/notifications', authenticateToken, (req, res) => {
  console.log('🔔 GET /api/notifications');
  const userNotifications = notifications.filter(n => n.userId === req.user.id);
  res.status(200).json({
    status: 200,
    notifications: userNotifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  });
});

// Отметить уведомление как прочитанное (PATCH /api/notifications/:id)
app.patch('/api/notifications/:id', authenticateToken, (req, res) => {
  console.log('✅ PATCH /api/notifications/:id');
  const notificationId = parseInt(req.params.id);
  
  const notificationIndex = notifications.findIndex(n => n.id === notificationId && n.userId === req.user.id);
  
  if (notificationIndex === -1) {
    return res.status(404).json({ message: 'Уведомление не найдено', status: 404 });
  }

  notifications[notificationIndex].read = true;

  res.status(200).json({
    status: 200,
    message: 'Уведомление отмечено как прочитанное',
    notification: notifications[notificationIndex]
  });
});

// Отметить все уведомления как прочитанные (POST /api/notifications/mark-all-read)
app.post('/api/notifications/mark-all-read', authenticateToken, (req, res) => {
  console.log('✅ POST /api/notifications/mark-all-read');
  notifications.forEach(notification => {
    if (notification.userId === req.user.id) {
      notification.read = true;
    }
  });

  res.status(200).json({
    status: 200,
    message: 'Все уведомления отмечены как прочитанные'
  });
});

// Удаление уведомления (DELETE /api/notifications/:id)
app.delete('/api/notifications/:id', authenticateToken, (req, res) => {
  console.log('🗑️ DELETE /api/notifications/:id');
  const notificationId = parseInt(req.params.id);
  
  const notificationIndex = notifications.findIndex(n => n.id === notificationId && n.userId === req.user.id);
  
  if (notificationIndex === -1) {
    return res.status(404).json({ message: 'Уведомление не найдено', status: 404 });
  }

  notifications.splice(notificationIndex, 1);
  res.status(204).send();
});

// ========== ОБРАБОТЧИК 404 ДЛЯ НЕСУЩЕСТВУЮЩИХ МАРШРУТОВ ==========
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.url} не найден`);
  res.status(404).json({
    message: `Маршрут ${req.method} ${req.url} не найден`,
    status: 404
  });
});

// ========== ЗАПУСК СЕРВЕРА ==========
app.listen(PORT, () => {
  console.log(`\nервер запущен на http://localhost:${PORT}`);
  console.log(`API доступен по адресу: http://localhost:${PORT}/api`);
});