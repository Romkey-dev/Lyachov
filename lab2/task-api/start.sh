#!/bin/bash
# Скрипт для быстрого запуска проекта на Linux/Mac

echo "🚀 Task Manager API - быстрый старт"
echo "===================================="
echo ""

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен!"
    echo "Установите Node.js из https://nodejs.org"
    exit 1
fi

echo "✅ Node.js версия: $(node --version)"
echo "✅ npm версия: $(npm --version)"
echo ""

# Проверка папки
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден"
    echo "Убедитесь, что вы в папке task-api"
    exit 1
fi

echo "📦 Установка зависимостей..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при установке зависимостей"
    exit 1
fi

echo ""
echo "✅ Установка завершена!"
echo ""
echo "🎯 Доступные команды:"
echo "  npm run dev    - Запустить в режиме разработки (с автоперезагрузкой)"
echo "  npm start      - Запустить в production режиме"
echo ""
echo "📌 Примеры использования:"
echo "  curl http://localhost:3000                    - Информация об API"
echo "  curl http://localhost:3000/api/tasks          - Получить все задачи"
echo ""
echo "📚 Документация:"
echo "  - БЫСТРЫЙ_СТАРТ.md          - Инструкции по запуску"
echo "  - README.md                  - Основная документация"
echo "  - Отчет.md                   - Полный отчет"
echo "  - ПРИМЕРЫ_ТЕСТИРОВАНИЯ.md    - 22+ примера curl"
echo ""
echo "💡 Совет: Выполните 'npm run dev' для запуска сервера"
echo ""
