# Лабораторная работа 15 — Lab6

Проект содержит две части лабораторной работы:

- `lab1501_etl/` — ETL-пайплайн на Python с загрузкой в SQLite.
- `lab1502_kafka/` — настройка Kafka, продюсер и консюмер.

## Запуск части 1: ETL

1. Перейдите в папку `lab1501_etl`:
   ```powershell
   cd "d:\учеб\прога 2 курс\lab6\lab1501_etl"
   ```
2. Создайте и активируйте виртуальное окружение:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
3. Установите зависимости:
   ```powershell
   pip install -r requirements.txt
   ```
4. Запустите скрипт:
   ```powershell
   python etl_pipeline.py
   ```
5. Графики сохраняются в `lab1501_etl\report`.

## Запуск части 2: Kafka

1. Перейдите в папку `lab1502_kafka`:
   ```powershell
   cd "d:\учеб\прога 2 курс\lab6\lab1502_kafka"
   ```
2. Запустите Kafka-сервисы:
   ```powershell
   docker-compose up -d
   ```
3. Создайте виртуальное окружение и установите зависимости:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```
4. Запустите консюмера в одном терминале:
   ```powershell
   python consumer.py
   ```
5. Запустите продюсера в другом терминале:
   ```powershell
   python producer.py
   ```
6. Откройте Kafka UI по адресу: http://localhost:8080

## Отчёты

- `lab1501_etl/report/report.md`
- `lab1502_kafka/report/report.md`
