import json
import os
import re
from typing import Dict, List, Optional

from dotenv import load_dotenv
from gigachat import GigaChat

# Загрузка переменных окружения из .env
load_dotenv()


class GigaChatAssistant:
    """Ассистент на основе GigaChat для задач разработки."""

    def __init__(self):
        self.credentials = os.getenv("GIGACHAT_CREDENTIALS")
        self.scope = os.getenv("GIGACHAT_SCOPE", "GIGACHAT_API_PERS")
        self.model = os.getenv("GIGACHAT_MODEL", "GigaChat-2")
        self.verify_ssl = os.getenv("GIGACHAT_VERIFY_SSL_CERTS", "False").lower() in (
            "true",
            "1",
            "yes",
        )

        if not self.credentials:
            raise ValueError(
                "GIGACHAT_CREDENTIALS не задан. Скопируйте токен в файл .env"
            )

        self.client = GigaChat(
            credentials=self.credentials,
            scope=self.scope,
            model=self.model,
            verify_ssl_certs=self.verify_ssl,
        )

    @staticmethod
    def _strip_markdown(text: str, language: Optional[str] = None) -> str:
        if not isinstance(text, str):
            return ""
        text = text.strip()
        if text.startswith("```"):
            parts = text.split("```")
            if len(parts) >= 3:
                text = parts[1]
            else:
                text = parts[1] if len(parts) > 1 else text
            text = text.strip()
        if language and text.startswith(language):
            text = text[len(language) :].strip()
        return text

    def generate_code(self, description: str, language: str = "python") -> str:
        prompt = f"""
Ты — эксперт по разработке на {language}. Напиши код на {language} для следующей задачи:

{description}

Требования к коду:
- Добавь аннотации типов (для Python)
- Добавь docstring с описанием функции, параметров и возвращаемого значения
- Используй понятные имена переменных
- Добавь обработку ошибок

Верни только код, без пояснений.
"""

        response = self.client.chat(prompt)
        code = response.choices[0].message.content
        return self._strip_markdown(code, language)

    def refactor_code(self, code: str, requirements: str) -> str:
        prompt = f"""
Проведи рефакторинг следующего кода согласно требованиям.

Исходный код:
```python
{code}
```

Требования к рефакторингу:
{requirements}

Дополнительные требования:
- Сохрани исходную функциональность
- Улучши читаемость кода
- Добавь аннотации типов (если их нет)
- Разбей на более мелкие функции (если необходимо)
- Добавь обработку ошибок

Верни только отрефакторенный код, без пояснений.
"""

        response = self.client.chat(prompt)
        refactored = response.choices[0].message.content
        return self._strip_markdown(refactored, "python")

    def generate_tests(self, code: str, framework: str = "pytest") -> str:
        prompt = f"""
Напиши тесты для следующего кода, используя {framework}.

Код для тестирования:
```python
{code}
```

Требования к тестам:
- Протестируй все публичные функции
- Включи позитивные и негативные сценарии
- Проверь граничные случаи
- Добавь понятные названия тестов

Верни только код с тестами, без пояснений.
"""

        response = self.client.chat(prompt)
        tests = response.choices[0].message.content
        return self._strip_markdown(tests, framework)

    def generate_documentation(self, code: str, doc_type: str = "docstring") -> str:
        if doc_type == "docstring":
            prompt = f"""
Добавь docstring для каждой функции в следующем коде.

Код:
```python
{code}
```

Формат docstring (Google Style):
```python
def function(param1: type, param2: type) -> return_type:
    \"\"\"Краткое описание.

    Args:
        param1: Описание параметра 1
        param2: Описание параметра 2

    Returns:
        Описание возвращаемого значения

    Raises:
        ExceptionType: Когда возникает исключение
    \"\"\"
```

Верни полный код с добавленными docstring.
"""
        else:
            prompt = f"""
Создай README документацию для следующего кода.

Код:
```python
{code}
```

Включи в документацию:
- Описание назначения кода
- Инструкцию по установке зависимостей
- Примеры использования
- Описание основных функций
- Информацию об авторах (если есть)
"""

        response = self.client.chat(prompt)
        documentation = response.choices[0].message.content
        if doc_type == "docstring":
            documentation = self._strip_markdown(documentation, "python")
        return documentation.strip()

    def analyze_code(self, code: str) -> Dict[str, List[str]]:
        prompt = f"""
Проанализируй следующий код и верни результат в формате JSON.

Код:
```python
{code}
```

Оцени следующие аспекты:
1. quality_issues: проблемы качества кода (нарушения PEP8, длинные функции и т.д.)
2. readability_issues: проблемы читаемости (плохие имена переменных, отсутствие комментариев)
3. security_issues: потенциальные уязвимости (инъекции, небезопасные функции)
4. performance_issues: проблемы производительности (неэффективные алгоритмы)
5. suggestions: конкретные предложения по улучшению

Формат ответа (JSON):
{
    "quality_issues": ["проблема 1", "проблема 2"],
    "readability_issues": ["проблема 1"],
    "security_issues": [],
    "performance_issues": ["проблема 1"],
    "suggestions": ["предложение 1", "предложение 2"]
}

Верни только JSON, без пояснений.
"""

        response = self.client.chat(prompt)
        result = response.choices[0].message.content
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0]
        elif "```" in result:
            result = result.split("```")[1]
        try:
            return json.loads(result.strip())
        except json.JSONDecodeError:
            return {"error": ["Не удалось распарсить ответ"], "raw_response": result}

    def chat(self, message: str, system_prompt: Optional[str] = None) -> str:
        if system_prompt:
            full_prompt = f"{system_prompt}\n\nПользователь: {message}\nАссистент:"
        else:
            full_prompt = message
        response = self.client.chat(full_prompt)
        return response.choices[0].message.content


if __name__ == "__main__":
    assistant = GigaChatAssistant()
    print("=== Тест чата ===")
    print(assistant.chat("Привет! Расскажи, что ты умеешь?"))
