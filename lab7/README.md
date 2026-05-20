# Лабораторная работа 16 — GigaChat и low-code

## Студент
- Ляхов Роман

## Структура проекта

- `part1_gigachat/` — реализация части 1 с GigaChat
- `part2_lowcode/` — концептуальный отчёт по low-code-инструменту AppMaster.io

## Как работать с частью 1

1. Откройте папку `part1_gigachat`
2. Установите виртуальное окружение:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

3. Скопируйте `.env.example` в `.env` и заполните токен.
4. Запустите проверку подключения:

```bash
python test_connection.py
```

5. Запустите тесты:

```bash
pytest test_refactored.py -v
```

## Что сделано

- Реализован класс `GigaChatAssistant` с методами генерации, рефакторинга и анализа.
- Написаны утилиты для проверки работы API и тестирования.
- Созданы файлы `generated_code.py` и `refactored_code.py`.
- Подготовлен отчёт и пример анализа.

## Дополнительная часть

В `part2_lowcode/` описана концептуальная реализация на платформе AppMaster.io. Этот раздел выполнен по желанию, в рамках выбора инструмента, отличного от Airtable.
