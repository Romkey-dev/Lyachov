# React + Vite To-Do App

Простое React-приложение для управления списком задач (To-Do List).

## Стек

- React 18
- TypeScript
- Vite
- Tailwind CSS

## Установка

```bash
cd todo-app
npm install
```

## Запуск

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

## Сборка

```bash
npm run build
npm run preview
```

## Структура проекта

```
todo-app/
├── src/
│   ├── App.tsx          # Основной компонент
│   ├── main.tsx         # Точка входа
│   └── index.css       # Стили Tailwind
├── public/              # Статические файлы
├── index.html          # HTML шаблон
├── package.json        # Зависимости
├── tailwind.config.js  # Конфигурация Tailwind
├── vite.config.ts      # Конфигурация Vite
└── tsconfig.json       # Конфигурация TypeScript
```

## Функционал

- Добавление новых задач
- Удаление задач
- Отметка задач как выполненные
- Статистика выполненных задач
- Обработка пустого списка задач
