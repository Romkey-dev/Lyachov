const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { 
  validateCreateTask, 
  validateUpdateTask, 
  validateId 
} = require('../middleware/validation');
const { 
  initializeDataFile, 
  readData, 
  writeData, 
  getNextId 
} = require('../utils/fileOperations');

// Инициализация файла данных при запуске
initializeDataFile();

// GET /api/tasks - получение всех задач с фильтрацией
router.get('/', async (req, res, next) => {
  try {
    const { category, completed, priority, sortBy, page = 1, limit = 10 } = req.query;
    const data = await readData();
    
    let tasks = [...data.tasks];
    
    // Фильтрация по категории
    if (category) {
      tasks = tasks.filter(t => t.category === category);
    }
    
    // Фильтрация по статусу выполнения
    if (completed !== undefined) {
      const isCompleted = completed === 'true';
      tasks = tasks.filter(t => t.completed === isCompleted);
    }
    
    // Фильтрация по приоритету
    if (priority) {
      const priorityNum = parseInt(priority);
      if (!isNaN(priorityNum)) {
        tasks = tasks.filter(t => t.priority === priorityNum);
      }
    }
    
    // Сортировка
    if (sortBy) {
      const isDescending = sortBy.startsWith('-');
      const field = isDescending ? sortBy.substring(1) : sortBy;
      
      tasks.sort((a, b) => {
        let valueA = a[field];
        let valueB = b[field];
        
        if (typeof valueA === 'string') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }
        
        if (valueA < valueB) {
          return isDescending ? 1 : -1;
        }
        if (valueA > valueB) {
          return isDescending ? -1 : 1;
        }
        return 0;
      });
    }
    
    // Пагинация
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedTasks = tasks.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      count: paginatedTasks.length,
      total: tasks.length,
      page: pageNum,
      limit: limitNum,
      data: paginatedTasks
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id - получение задачи по ID
router.get('/:id', validateId, async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const data = await readData();
    
    const task = data.tasks.find(t => t.id === taskId);
    
    if (!task) {
      const error = new Error('Task not found');
      error.status = 404;
      throw error;
    }
    
    res.json({
      success: true,
      data: task
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks - создание новой задачи
router.post('/', validateCreateTask, async (req, res, next) => {
  try {
    const { title, description, category, priority, dueDate } = req.body;
    const data = await readData();
    
    const newTask = {
      id: await getNextId(),
      uuid: uuidv4(),
      title,
      description: description || '',
      category: category || 'personal',
      priority: priority || 3,
      dueDate: dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Добавляем новую задачу в массив
    data.tasks.push(newTask);
    
    // Сохраняем обновленные данные
    await writeData(data);
    
    res.status(201).json({
      success: true,
      message: 'Задача успешно создана',
      data: newTask
    });
    
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/:id - полное обновление задачи
router.put('/:id', validateId, validateUpdateTask, async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const updates = req.body;
    const data = await readData();
    
    const taskIndex = data.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      const error = new Error('Task not found');
      error.status = 404;
      throw error;
    }
    
    const task = data.tasks[taskIndex];
    
    // Обновляем только переданные поля
    Object.assign(task, updates);
    task.updatedAt = new Date().toISOString();
    
    // Сохраняем обновленные данные
    await writeData(data);
    
    res.json({
      success: true,
      message: 'Задача успешно обновлена',
      data: task
    });
    
  } catch (error) {
    next(error);
  }
});

// PATCH /api/tasks/:id/complete - отметка задачи как выполненной
router.patch('/:id/complete', validateId, async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const data = await readData();
    
    const task = data.tasks.find(t => t.id === taskId);
    
    if (!task) {
      const error = new Error('Task not found');
      error.status = 404;
      throw error;
    }
    
    task.completed = true;
    task.updatedAt = new Date().toISOString();
    
    // Сохраняем обновленные данные
    await writeData(data);
    
    res.json({
      success: true,
      message: 'Задача отмечена как выполненная',
      data: task
    });
    
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id - удаление задачи
router.delete('/:id', validateId, async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const data = await readData();
    
    const taskIndex = data.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      const error = new Error('Task not found');
      error.status = 404;
      throw error;
    }
    
    data.tasks.splice(taskIndex, 1);
    
    // Сохраняем обновленные данные
    await writeData(data);
    
    res.json({
      success: true,
      message: 'Задача успешно удалена'
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/stats/summary - статистика по задачам
router.get('/stats/summary', async (req, res, next) => {
  try {
    const data = await readData();
    const tasks = data.tasks;
    
    const stats = {
      total: tasks.length,
      completed: 0,
      pending: 0,
      overdue: 0,
      byCategory: {},
      byPriority: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      }
    };
    
    const now = new Date();
    
    tasks.forEach(task => {
      // Подсчет выполненных и невыполненных задач
      if (task.completed) {
        stats.completed++;
      } else {
        stats.pending++;
      }
      
      // Подсчет просроченных задач
      if (task.dueDate && !task.completed) {
        const dueDate = new Date(task.dueDate);
        if (dueDate < now) {
          stats.overdue++;
        }
      }
      
      // Распределение по категориям
      if (!stats.byCategory[task.category]) {
        stats.byCategory[task.category] = 0;
      }
      stats.byCategory[task.category]++;
      
      // Распределение по приоритетам
      stats.byPriority[task.priority]++;
    });
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/search/text - поиск задач
router.get('/search/text', async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Поисковый запрос должен содержать минимум 2 символа'
      });
    }
    
    const data = await readData();
    const searchTerm = q.toLowerCase().trim();
    
    const results = data.tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm) ||
      task.description.toLowerCase().includes(searchTerm)
    );
    
    res.json({
      success: true,
      count: results.length,
      data: results
    });
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;
