import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ITask } from '../../types';

interface TasksState {
  tasks: ITask[];
  loading: boolean;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
};

// GET - получение задач
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (userEmail: string) => {
    console.log(`GET /api/tasks?user=${userEmail} - запрос`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const allTasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    const tasks = allTasks[userEmail] || [];
    
    console.log(`GET /api/tasks - 200 OK, получено ${tasks.length} задач`);
    return tasks;
  }
);

// POST - создание задачи
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ task, userEmail }: { task: Omit<ITask, 'id' | 'createdAt'>; userEmail: string }) => {
    console.log(`POST /api/tasks - создание задачи "${task.title}"`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newTask: ITask = {
      ...task,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      userId: userEmail,
    };
    
    const allTasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    if (!allTasks[userEmail]) allTasks[userEmail] = [];
    allTasks[userEmail].push(newTask);
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    
    console.log(`POST /api/tasks - 201 Created, ID: ${newTask.id}`);
    return newTask;
  }
);

//PUT - ПОЛНОЕ ОБНОВЛЕНИЕ (заменяет ВСЮ задачу)
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, fullTask, userEmail }: { 
    taskId: number; 
    fullTask: ITask;  // ТРЕБУЕТ ВСЕ ПОЛЯ задачи
    userEmail: string;
  }) => {
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const allTasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    const userTasks = allTasks[userEmail] || [];
    const taskIndex = userTasks.findIndex((t: ITask) => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error('Задача не найдена');
    }
    
    // PUT - ПОЛНОСТЬЮ заменяем старую задачу НОВОЙ
    userTasks[taskIndex] = fullTask;
    allTasks[userEmail] = userTasks;
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    
    console.log(`PUT /api/tasks/${taskId} - 200 OK (задача полностью заменена)`);
    
    return fullTask;
  }
);

//PATCH - ЧАСТИЧНОЕ ОБНОВЛЕНИЕ (меняет ТОЛЬКО указанные поля)
export const patchTask = createAsyncThunk(
  'tasks/patchTask',
  async ({ taskId, updates, userEmail }: { 
    taskId: number; 
    updates: Partial<ITask>;  // ТОЛЬКО поля, которые нужно изменить
    userEmail: string;
  }) => {
    console.log(`PATCH /api/tasks/${taskId} `);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const allTasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    const userTasks = allTasks[userEmail] || [];
    const taskIndex = userTasks.findIndex((t: ITask) => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error('Задача не найдена');
    }
    
    // PATCH - обновляем ТОЛЬКО указанные поля, остальные остаются как были
    const oldTask = { ...userTasks[taskIndex] };
    userTasks[taskIndex] = { ...userTasks[taskIndex], ...updates };
    allTasks[userEmail] = userTasks;
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    
    console.log(`PATCH /api/tasks/${taskId} - 200 OK (обновлены поля: ${Object.keys(updates).join(', ')})`);
    
    return { taskId, updates };
  }
);

// DELETE - удаление задачи
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async ({ taskId, userEmail }: { taskId: number; userEmail: string }) => {
    console.log(`DELETE /api/tasks/${taskId} - удаление задачи`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const allTasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    const userTasks = allTasks[userEmail] || [];
    const filteredTasks = userTasks.filter((t: ITask) => t.id !== taskId);
    allTasks[userEmail] = filteredTasks;
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    
    console.log(`DELETE /api/tasks/${taskId} - 204 No Content`);
    return taskId;
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasks: (state) => {
      state.tasks = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(patchTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.taskId);
        if (index !== -1) {
          state.tasks[index] = { ...state.tasks[index], ...action.payload.updates };
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
      });
  },
});

export const { clearTasks } = tasksSlice.actions;
export default tasksSlice.reducer;