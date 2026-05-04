# Book Library API

REST API для управления каталогом книг в библиотеке, разработанное на FastAPI (Python).

## Описание

Лабораторная работа №2 по дисциплине "Программирование" - разработка REST API с использованием FastAPI и Pydantic.

## Технологии

- **Python 3.10+**
- **FastAPI** - веб-фреймворк
- **Pydantic** - валидация данных
- **Uvicorn** - ASGI сервер

## Структура проекта

```
book_api/
├── main.py              # Основное приложение FastAPI
├── models.py            # Pydantic модели данных
├── routers.py           # Роутер с эндпоинтами API
├── requirements.txt     # Зависимости проекта
└── README.md             # Этот файл
```

## Установка

```bash
# Создание виртуального окружения
python3 -m venv venv

# Активация виртуального окружения
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Установка зависимостей
pip install -r requirements.txt
```

## Запуск

```bash
# Запуск сервера разработки
python main.py

# Или альтернативный способ
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

| Метод | URL | Описание |
|-------|-----|-----------|
| GET | `/api/v1/books` | Получить список всех книг с фильтрацией |
| GET | `/api/v1/books/{id}` | Получить книгу по ID |
| POST | `/api/v1/books` | Создать новую книгу |
| PUT | `/api/v1/books/{id}` | Обновить книгу |
| DELETE | `/api/v1/books/{id}` | Удалить книгу |
| POST | `/api/v1/books/{id}/borrow` | Взять книгу |
| POST | `/api/v1/books/{id}/return` | Вернуть книгу |
| GET | `/api/v1/stats` | Статистика библиотеки |

## Документация

После запуска API документация доступна по адресам:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Примеры использования

### Создание книги

```bash
curl -X POST "http://localhost:8000/api/v1/books" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Преступление и наказание",
    "author": "Фёдор Достоевский",
    "genre": "fiction",
    "publication_year": 1866,
    "pages": 671,
    "isbn": "9781234567898"
  }'
```

### Получение списка книг

```bash
curl -X GET "http://localhost:8000/api/v1/books"
```

### Заимствование книги

```bash
curl -X POST "http://localhost:8000/api/v1/books/1/borrow" \
  -H "Content-Type: application/json" \
  -d '{"borrower_name": "Иван Иванов", "return_days": 14}'
```

### Возврат книги

```bash
curl -X POST "http://localhost:8000/api/v1/books/1/return"
```

### Получение статистики

```bash
curl -X GET "http://localhost:8000/api/v1/stats"
```

## Фильтрация

API поддерживает следующие параметры фильтрации:

- `genre` - фильтр по жанру (fiction, non_fiction, science, fantasy, mystery, biography)
- `author` - фильтр по автору (регистронезависимый поиск)
- `available_only` - только доступные книги
- `skip` - количество книг для пропуска (пагинация)
- `limit` - лимит книг на странице

Пример:

```bash
curl -X GET "http://localhost:8000/api/v1/books?genre=fiction&available_only=true&limit=10"
```

## Выполнил

- **Студент:** Ляхов Роман
- **Группа:** ---
- **Дата:** 2026

## Лицензия

MIT