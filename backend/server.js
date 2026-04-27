const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;
const SECRET_KEY = 'your-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());

// Хранилище данных (в памяти)
let users = []; // Массив для хранения пользователей в памяти (при перезапуске сервера данные теряются)
let tasks = [];// Массив для хранения задач
let categories = [];// Массив для хранения категорий
let notifications = [];// Массив для хранения уведомлений
let nextTaskId = 1; // Счетчик для генерации уникальных ID задач 
let nextCategoryId = 1; // Счетчик для генерации уникальных ID категорий
let nextNotificationId = 1;// Счетчик для генерации уникальных ID уведомлений

// Объявляем middleware функцию для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) { // Если токен отсутствует
    return res.status(401).json({ message: 'Токен не предоставлен', status: 401 }); // Возвращаем ошибку 401
  }

  jwt.verify(token, SECRET_KEY, (err, user) => { // Проверяем валидность токена с секретным ключом
    if (err) { // Если токен недействительный
      return res.status(403).json({ message: 'Недействительный токен', status: 403 }); // Возвращаем ошибку 403
    }
    req.user = user; // Сохраняем расшифрованные данные пользователя в объект запроса
    next(); // Передаем управление следующему обработчику
  });
};

// Регистрация (POST /api/auth/register)
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body; //извлекаем поля name, email, password из тела запроса
  const existingUser = users.find(u => u.email === email); // Ищем пользователя с таким email в массиве users

  if (existingUser) { // Если пользователь уже существует
    return res.status(409).json({ message: 'Пользователь с таким email уже существует', status: 409 });// Возвращаем 409 такой email уже занят
  }

  if (!name || !email || !password) {// Проверяем, что все поля заполнены
    return res.status(400).json({ message: 'Все поля обязательны для заполнения', status: 400 }); // 400 - неверный запрос
  }

  if (password.length < 6) {// Проверяем минимальную длину пароля
    return res.status(400).json({ message: 'Пароль должен быть минимум 6 символов', status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = { // Создаем объект нового пользователя

    id: Date.now().toString(), // ID генерируем из текущей timestamp
    name,
    email,
    password: hashedPassword, // Сохраняем хеш пароля, а не сам пароль
    createdAt: new Date().toISOString()
  };

  users.push(newUser); // Добавляем пользователя в массив

  const token = jwt.sign(// Создаем JWT токен
    { id: newUser.id, email: newUser.email }, // Данные, которые будут зашифрованы в токене
    SECRET_KEY, // Секретный ключ для подписи
    { expiresIn: '7d' }
  );

  res.status(201).json({ // Отправляем успешный ответ с кодом 201 Created
    status: 201,
    message: 'Регистрация успешна',
    user: { id: newUser.id, name: newUser.name, email: newUser.email, createdAt: newUser.createdAt },
    token
  });
});

// Вход (POST /api/auth/login)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Ищем пользователя
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Неверный email или пароль', status: 401 });
  }

  // Проверяем пароль
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Неверный email или пароль', status: 401 });
  }

  // Создаем токен
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '7d' });

  res.status(200).json({
    status: 200,
    message: 'Вход выполнен успешно',
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    token
  });
});

// Получение информации о текущем пользователе (GET /api/users/me)
app.get('/api/users/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден', status: 404 });
  }

  // Получаем статистику
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

// Выход (POST /api/auth/logout)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Выход выполнен успешно', status: 200 });
});


// Получение всех задач пользователя (GET /api/tasks)
app.get('/api/tasks', authenticateToken, (req, res) => {
  const userTasks = tasks.filter(t => t.userId === req.user.id);
  res.status(200).json({
    status: 200,
    tasks: userTasks
  });
});

// Создание задачи (POST /api/tasks)
app.post('/api/tasks', authenticateToken, (req, res) => {
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

  // Создаем уведомление о создании задачи
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

  // Создаем уведомление при изменении статуса
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
  const taskId = parseInt(req.params.id);
  
  const taskIndex = tasks.findIndex(t => t.id === taskId && t.userId === req.user.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Задача не найдена', status: 404 });
  }

  const deletedTask = tasks[taskIndex];
  tasks.splice(taskIndex, 1);

  // Создаем уведомление об удалении
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



// Получение всех категорий пользователя (GET /api/categories)
app.get('/api/categories', authenticateToken, (req, res) => {
  const userCategories = categories.filter(c => c.userId === req.user.id);
  
  // Добавляем количество задач в каждой категории
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
  const categoryId = parseInt(req.params.id);
  
  const categoryIndex = categories.findIndex(c => c.id === categoryId && c.userId === req.user.id);
  
  if (categoryIndex === -1) {
    return res.status(404).json({ message: 'Категория не найдена', status: 404 });
  }

  // Переносим задачи из удаляемой категории в null
  tasks.forEach(task => {
    if (task.categoryId === categoryId && task.userId === req.user.id) {
      task.categoryId = null;
    }
  });

  categories.splice(categoryIndex, 1);

  res.status(204).send();
});



// Получение всех уведомлений пользователя (GET /api/notifications)
app.get('/api/notifications', authenticateToken, (req, res) => {
  const userNotifications = notifications.filter(n => n.userId === req.user.id);
  res.status(200).json({
    status: 200,
    notifications: userNotifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  });
});

// Отметить уведомление как прочитанное (PATCH /api/notifications/:id)
app.patch('/api/notifications/:id', authenticateToken, (req, res) => {
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
  // Находим все уведомления пользователя и отмечаем как прочитанные
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
  const notificationId = parseInt(req.params.id);
  
  const notificationIndex = notifications.findIndex(n => n.id === notificationId && n.userId === req.user.id);
  
  if (notificationIndex === -1) {
    return res.status(404).json({ message: 'Уведомление не найдено', status: 404 });
  }

  notifications.splice(notificationIndex, 1);
  res.status(204).send();
});

// Запуск сервера
app.listen(PORT, () => {// Запускаем HTTP сервер на указанном порту
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`API доступен по адресу: http://localhost:${PORT}/api`);
});