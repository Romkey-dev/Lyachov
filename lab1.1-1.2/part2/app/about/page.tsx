export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Обо мне</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Навыки</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>JavaScript / TypeScript</li>
          <li>React и Next.js</li>
          <li>Vue.js</li>
          <li>HTML / CSS / Tailwind</li>
          <li>Node.js</li>
        </ul>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-3">Опыт работы</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Веб-разработчик</h3>
            <p className="text-gray-600">2024 - настоящее время</p>
            <p className="text-sm text-gray-500">Разработка веб-приложений на React и Next.js</p>
          </div>
          <div>
            <h3 className="font-semibold">Стажер-разработчик</h3>
            <p className="text-gray-600">2023 - 2024</p>
            <p className="text-sm text-gray-500">Веб-разработка, изучение современных фреймворков</p>
          </div>
        </div>
      </div>
    </div>
  )
}