# Task Manager API

Полнофункциональный REST API для управления задачами на базе Express.js и Node.js

## Структура проекта

```
task-api/
├── src/
│   ├── app.js                 # Основное приложение Express
│   ├── server.js              # Точка входа сервера
│   ├── routes/
│   │   └── tasks.js           # Роутер задач
│   ├── middleware/
│   │   ├── validation.js      # Middleware валидации
│   │   └── errorHandler.js    # Обработчики ошибок
│   └── utils/
│       └── fileOperations.js  # Операции с файлами
├── tasks.json                 # Файл с данными (создастся автоматически)
├── package.json
├── .env
└── README.md
```

## Установка и запуск

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

### Запуск в production режиме

```bash
NODE_ENV=production npm start
```

API будет доступно по адресу: `http://localhost:3000`

## API Endpoints

### Получить информацию об API
```
GET /
```

### Проверка здоровья сервиса
```
GET /health
```

### Управление задачами

#### Получить все задачи с фильтрацией и пагинацией
```
GET /api/tasks
Query параметры:
  - category: work, personal, shopping, health
  - completed: true или false
  - priority: 1-5
  - sortBy: field или -field (для обратной сортировки)
  - page: номер страницы (по умолчанию 1)
  - limit: количество элементов на странице (по умолчанию 10)

Пример: GET /api/tasks?category=work&completed=false&sortBy=-priority&page=1&limit=5
```

#### Создать новую задачу
```
POST /api/tasks
Content-Type: application/json

{
  "title": "Купить продукты",
  "description": "Молоко, хлеб, яйца",
  "category": "shopping",
  "priority": 2,
  "dueDate": "2024-12-31"
}
```

#### Получить задачу по ID
```
GET /api/tasks/:id
```

#### Обновить задачу
```
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "Новое название",
  "priority": 4
}
```

#### Отметить задачу как выполненную
```
PATCH /api/tasks/:id/complete
```

#### Удалить задачу
```
DELETE /api/tasks/:id
```

#### Получить статистику
```
GET /api/tasks/stats/summary
```

#### Поиск задач
```
GET /api/tasks/search/text?q=ключевое+слово
```

## Примеры использования

### С помощью curl

```bash
# Создать задачу
curl -X POST "http://localhost:3000/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Купить продукты",
    "description": "Молоко, хлеб, яйца",
    "category": "shopping",
    "priority": 2,
    "dueDate": "2024-12-31"
  }'

# Получить все задачи
curl -X GET "http://localhost:3000/api/tasks"

# Получить задачу по ID
curl -X GET "http://localhost:3000/api/tasks/1"

# Отметить задачу как выполненную
curl -X PATCH "http://localhost:3000/api/tasks/1/complete"

# Получить статистику
curl -X GET "http://localhost:3000/api/tasks/stats/summary"

# Поиск по ключевому слову
curl -X GET "http://localhost:3000/api/tasks/search/text?q=продукты"

# Обновить задачу
curl -X PUT "http://localhost:3000/api/tasks/1" \
  -H "Content-Type: application/json" \
  -d '{"priority": 5}'

# Удалить задачу
curl -X DELETE "http://localhost:3000/api/tasks/1"
```

## Особенности реализации

### Middleware

- **helmet** - Установка заголовков безопасности
- **cors** - Обработка cross-origin запросов
- **express-rate-limit** - Ограничение частоты запросов
- **express.json()** - Парсинг JSON тела запроса
- **Валидация** - Проверка входных данных с помощью Joi

### Валидация данных

Для создания и обновления задач используется библиотека **Joi**:
- Название: 3-100 символов, обязательно
- Описание: до 500 символов
- Категория: work, personal, shopping, health
- Приоритет: 1-5
- Дата выполнения: должна быть в будущем

### Обработка ошибок

- Все ошибки обрабатываются централизованным middleware
- Возвращаются структурированные JSON ответы с деталями ошибок
- Правильные HTTP статус-коды (404, 400, 500 и т.д.)

### Фильтрация и сортировка

- Фильтрация по категории, статусу выполнения, приоритету
- Сортировка по любому полю (прямая и обратная)
- Пагинация с параметрами page и limit

## Стек технологий

- **Express.js** - веб-фреймворк
- **Node.js** - runtime
- **Joi** - валидация данных
- **uuid** - генерация уникальных идентификаторов
- **helmet** - безопасность
- **cors** - cross-origin поддержка
- **dotenv** - управление переменными окружения
- **express-rate-limit** - ограничение запросов
- **nodemon** - автоматический перезапуск при разработке

## Версия

1.0.0

## Автор

Ляхов Роман
