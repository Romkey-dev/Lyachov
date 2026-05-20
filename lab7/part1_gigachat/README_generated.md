# Документация модуля GigaChat Assistant

## Описание

Этот модуль реализует класс `GigaChatAssistant` для работы с API GigaChat. Он поддерживает генерацию кода, рефакторинг, создание тестов, генерацию документации и анализ качества кода.

## Установка зависимостей

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## Настройка окружения

Создайте файл `.env` в папке `part1_gigachat` и добавьте:

```bash
GIGACHAT_CREDENTIALS=ваш_ключ_авторизации
GIGACHAT_SCOPE=GIGACHAT_API_PERS
GIGACHAT_MODEL=GigaChat-2
GIGACHAT_VERIFY_SSL_CERTS=False
```

## Использование

### Проверка подключения

```bash
python test_connection.py
```

### Пример запуска класса

```python
from gigachat_client import GigaChatAssistant

assistant = GigaChatAssistant()
print(assistant.chat("Привет!"))
```

### Основные методы

- `generate_code(description, language)` — генерирует код по описанию.
- `refactor_code(code, requirements)` — рефакторирует существующий код.
- `generate_tests(code, framework)` — генерирует тесты.
- `generate_documentation(code, doc_type)` — создаёт документацию.
- `analyze_code(code)` — анализирует код и возвращает JSON.

## Сгенерированные функции

Файл `generated_code.py` содержит:
- `validate_email(email: str) -> bool`
- `sort_by_key(data: List[Dict], key: str, reverse: bool = False) -> List[Dict]`
- `timer(func)` — декоратор измерения времени выполнения.

## Отрефакторированный код

Файл `refactored_code.py` содержит:
- `add_numbers(left_value, right_value)`
- `calculate_result(base, multiplier, offset)`
- `process_values(values)`
- `get_user_by_id(user_id)`

## Тестирование

```bash
pytest test_refactored.py -v
```
