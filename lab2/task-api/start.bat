@echo off
REM Скрипт для быстрого запуска проекта на Windows

echo.
echo 🚀 Task Manager API - быстрый старт
echo ====================================
echo.

REM Проверка Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не установлен!
    echo Установите Node.js из https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js версия: 
node --version
echo ✅ npm версия: 
npm --version
echo.

REM Проверка package.json
if not exist "package.json" (
    echo ❌ Ошибка: package.json не найден
    echo Убедитесь, что вы в папке task-api
    pause
    exit /b 1
)

echo 📦 Установка зависимостей...
echo.

REM Установка зависимостей
call npm install

if %errorlevel% neq 0 (
    echo ❌ Ошибка при установке зависимостей
    pause
    exit /b 1
)

echo.
echo ✅ Установка завершена!
echo.
echo 🎯 Доступные команды:
echo   npm run dev    - Запустить в режиме разработки (с автоперезагрузкой)
echo   npm start      - Запустить в production режиме
echo.
echo 📌 Примеры использования:
echo   curl http://localhost:3000                    - Информация об API
echo   curl http://localhost:3000/api/tasks          - Получить все задачи
echo.
echo 📚 Документация:
echo   - БЫСТРЫЙ_СТАРТ.md          - Инструкции по запуску
echo   - README.md                  - Основная документация
echo   - Отчет.md                   - Полный отчет
echo   - ПРИМЕРЫ_ТЕСТИРОВАНИЯ.md    - 22+ примера curl
echo.
echo 💡 Совет: Выполните 'npm run dev' для запуска сервера
echo.
pause
