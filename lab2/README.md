#  Лабораторная работа 2
##  Студент: Ляхов Роман | Дата: 04.05.2026

---

## 📋 Обзор проекта

Лабораторная работа 2 состоит из **двух независимых частей**:

| Часть | Технология | Тема | Статус |
|-------|-----------|------|--------|
| **Часть 1** | FastAPI (Python) | API для библиотеки книг | ✅ [Готова](lab1001-API%20на%20FastAPI%20%28Python%29.md) |
| **Часть 2** | Express (Node.js) | API для управления задачами | ✅ [Готова](task-api/) |

---

##  БЫСТРЫЙ СТАРТ

### Способ 1: Запустить обе части одновременно (разные терминалы)

#### Терминал 1: FastAPI (Python)
```bash
cd "d:\учеб\прога 2 курс\2 лаба\book_api"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
**Результат:** http://localhost:8000/docs (Swagger UI)

#### Терминал 2: Express (Node.js)
```bash
cd "d:\учеб\прога 2 курс\2 лаба\task-api"
npm install
npm run dev
```
**Результат:** http://localhost:3000

### Способ 2: Запустить отдельные части

---

## 📌 ЧАСТЬ 1: FastAPI (Python) - Библиотека книг

###  Расположение
```
└── book_api/
    ├── main.py          # Основное приложение FastAPI
    ├── models.py        # Pydantic модели
    ├── routers.py       # API эндпоинты
    ├── requirements.txt # Зависимости
    └── venv/            # Виртуальное окружение
```

###  Установка и запуск

#### Windows (PowerShell)
```powershell
cd "d:\учеб\прога 2 курс\2 лаба\book_api"

# Создать виртуальное окружение
python -m venv venv

# Активировать его
.\venv\Scripts\Activate.ps1

# Установить зависимости
pip install -r requirements.txt

# Запустить сервер
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
```

###  Результат
```
INFO:     Application startup complete [started server process]
INFO:     Uvicorn running on http://0.0.0.0:8000
```

###  Доступные URL

| URL | Описание |
|-----|---------|
| http://localhost:8000 | Информация об API |
| http://localhost:8000/docs | **Swagger UI** (интерактивная документация) |
| http://localhost:8000/redoc | ReDoc документация |
| http://localhost:8000/health | Проверка здоровья |

###  Примеры использования

#### Создать книгу
```bash
curl -X POST "http://localhost:8000/api/v1/books" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Война и мир",
    "author": "Лев Толстой",
    "genre": "fiction",
    "publication_year": 1869,
    "pages": 1225,
    "isbn": "9781234567897"
  }'
```

#### Получить все книги
```bash
curl -X GET "http://localhost:8000/api/v1/books"
```

#### Получить книгу по ID
```bash
curl -X GET "http://localhost:8000/api/v1/books/1"
```

#### Обновить книгу
```bash
curl -X PUT "http://localhost:8000/api/v1/books/1" \
  -H "Content-Type: application/json" \
  -d '{"pages": 1300}'
```

#### Взять книгу
```bash
curl -X POST "http://localhost:8000/api/v1/books/1/borrow" \
  -H "Content-Type: application/json" \
  -d '{"borrower_name": "Иван Иванов", "return_days": 14}'
```

#### Вернуть книгу
```bash
curl -X POST "http://localhost:8000/api/v1/books/1/return"
```

#### Получить статистику
```bash
curl -X GET "http://localhost:8000/api/v1/stats"
```

#### Удалить книгу
```bash
curl -X DELETE "http://localhost:8000/api/v1/books/1"
```


```

---

##  ЧАСТЬ 2: Express (Node.js) - Управление задачами

###  Расположение
```
├── src/
│   ├── server.js                # Запуск сервера
│   ├── app.js                   # Express приложение
│   ├── routes/tasks.js          # API эндпоинты
│   ├── middleware/
│   │   ├── validation.js        # Валидация (Joi)
│   │   └── errorHandler.js      # Обработка ошибок
│   └── utils/fileOperations.js  # Работа с файлами
├── package.json                 # Зависимости
├── .env                         # Переменные окружения
└── tasks.json                   # Данные (создается автоматически)
```

### 🔧 Установка и запуск

#### Windows (PowerShell)
```powershell
cd "d:\учеб\прога 2 курс\2 лаба\task-api"

# Установить зависимости
npm install

# Запустить в режиме разработки
npm run dev
```

###  Результат
```
🚀 Сервер запущен на порту 3000
📚 Документация API доступна по адресу: http://localhost:3000/
🌐 Режим: development
```

###  Доступные URL

| URL | Описание |
|-----|---------|
| http://localhost:3000 | Информация об API |
| http://localhost:3000/health | Проверка здоровья |
| http://localhost:3000/api/tasks | Управление задачами |

###  Примеры использования

#### Создать задачу
```bash
curl -X POST "http://localhost:3000/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Купить продукты",
    "description": "Молоко, хлеб, яйца",
    "category": "shopping",
    "priority": 2
  }'
```

#### Получить все задачи
```bash
curl -X GET "http://localhost:3000/api/tasks"
```

#### Получить с фильтрацией
```bash
# По категории
curl "http://localhost:3000/api/tasks?category=work"

# По статусу
curl "http://localhost:3000/api/tasks?completed=false"

# С сортировкой
curl "http://localhost:3000/api/tasks?sortBy=-priority"

# С пагинацией
curl "http://localhost:3000/api/tasks?page=1&limit=5"
```

#### Получить задачу по ID
```bash
curl -X GET "http://localhost:3000/api/tasks/1"
```

#### Обновить задачу
```bash
curl -X PUT "http://localhost:3000/api/tasks/1" \
  -H "Content-Type: application/json" \
  -d '{"priority": 5}'
```

#### Отметить как выполненную
```bash
curl -X PATCH "http://localhost:3000/api/tasks/1/complete"
```

#### Удалить задачу
```bash
curl -X DELETE "http://localhost:3000/api/tasks/1"
```

#### Получить статистику
```bash
curl -X GET "http://localhost:3000/api/tasks/stats/summary"
```

#### Поиск
```bash
curl -X GET "http://localhost:3000/api/tasks/search/text?q=продукты"
```

### 🛠️ Полезные команды

```bash
# Проверить версию Node.js
node --version

# Проверить версию npm
npm --version

# Список установленных пакетов
npm list

# Установить зависимости
npm install

# Запустить в режиме разработки (с автоперезагрузкой)
npm run dev

# Запустить в production режиме
npm start

# Запустить на другом порту
PORT=8080 npm run dev
```

---

##  Документация обеих частей

### Часть 1: FastAPI

| Документ | Содержание |
|----------|-----------|
| [lab1001-API на FastAPI (Python).md](lab1001-API%20на%20FastAPI%20%28Python%29.md) | Полное описание задания FastAPI |
| Swagger UI | http://localhost:8000/docs (автоматическая документация) |
| ReDoc | http://localhost:8000/redoc (альтернативная документация) |

### Часть 2: Express

| Документ | Содержание |
|----------|-----------|
| [task-api/README.md](task-api/README.md) | Основная документация |
| [task-api/Отчет.md](task-api/Отчет.md) | Полный отчет |
| [task-api/ПРИМЕРЫ_ТЕСТИРОВАНИЯ.md](task-api/ПРИМЕРЫ_ТЕСТИРОВАНИЯ.md) | 22+ примера curl |
| [task-api/АРХИТЕКТУРА.md](task-api/АРХИТЕКТУРА.md) | Диаграммы и структура |

---

## 📊 Сравнение обеих частей

| Аспект | FastAPI (Часть 1) | Express (Часть 2) |
|--------|------------------|------------------|
| **Язык** | Python | JavaScript (Node.js) |
| **Фреймворк** | FastAPI | Express.js |
| **База данных** | In-memory (dict) | JSON файл |
| **Валидация** | Pydantic | Joi |
| **Документация** | Автоматическая (Swagger/ReDoc) | Ручная (README + примеры) |
| **Производительность** | Очень высокая (асинхронная) | Высокая |
| **Кривая обучения** | Средняя | Средняя |
| **Порт** | 8000 | 3000 |

### Сравнение API

**FastAPI:**
```
GET    /api/v1/books               - Список книг
POST   /api/v1/books               - Создать книгу
GET    /api/v1/books/{id}          - Получить книгу
PUT    /api/v1/books/{id}          - Обновить книгу
DELETE /api/v1/books/{id}          - Удалить книгу
POST   /api/v1/books/{id}/borrow   - Взять книгу
POST   /api/v1/books/{id}/return   - Вернуть книгу
GET    /api/v1/stats               - Статистика
```

**Express:**
```
GET    /api/tasks                  - Список задач (с фильтрацией)
POST   /api/tasks                  - Создать задачу
GET    /api/tasks/:id              - Получить задачу
PUT    /api/tasks/:id              - Обновить задачу
DELETE /api/tasks/:id              - Удалить задачу
PATCH  /api/tasks/:id/complete     - Отметить выполненной
GET    /api/tasks/stats/summary    - Статистика
GET    /api/tasks/search/text      - Поиск
```

---

## ✅ Чек-листы готовности

### Часть 1: FastAPI
- [ ] Python 3.8+ установлен
- [ ] Виртуальное окружение создано
- [ ] Зависимости установлены (`pip install -r requirements.txt`)
- [ ] Сервер запущен (`uvicorn main:app --reload`)
- [ ] Swagger UI доступен (http://localhost:8000/docs)
- [ ] Можно создать книгу
- [ ] Можно получить список книг
- [ ] Можно взять/вернуть книгу

### Часть 2: Express
- [ ] Node.js 18+ установлен
- [ ] Зависимости установлены (`npm install`)
- [ ] Сервер запущен (`npm run dev`)
- [ ] API доступен (http://localhost:3000)
- [ ] Можно создать задачу
- [ ] Можно получить список задач
- [ ] Фильтрация работает
- [ ] Поиск работает

---

### Просмотр логов

**FastAPI:**
```bash
# Подробные логи
uvicorn main:app --reload --log-level debug
```

**Express:**
```bash
# Логи выводятся автоматически в консоль
npm run dev
```

### Изменение портов

**FastAPI:**
```bash
uvicorn main:app --reload --port 9000
```

**Express:**
```bash
PORT=8080 npm run dev
```

---

### Официальная документация

- [FastAPI документация](https://fastapi.tiangolo.com/)
- [Express.js документация](https://expressjs.com/)
- [Pydantic документация](https://docs.pydantic.dev/)
- [Joi валидация](https://joi.dev/)

---

- **Автор:** Ляхов Роман
- **Дата:** 04.05.2026


**Готово к использованию! 🚀**
