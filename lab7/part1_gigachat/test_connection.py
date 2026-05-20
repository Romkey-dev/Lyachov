import os
from dotenv import load_dotenv
from gigachat import GigaChat

load_dotenv()

def main() -> None:
    token = os.getenv("GIGACHAT_CREDENTIALS")
    if not token:
        raise RuntimeError(
            "GIGACHAT_CREDENTIALS не найден в .env. Скопируйте токен из личного кабинета GigaChat."
        )

    with GigaChat(credentials=token, verify_ssl_certs=False) as giga:
        response = giga.chat("Привет! Ты работаешь?")
        content = response.choices[0].message.content
        print("Ответ от GigaChat:")
        print(content)


if __name__ == "__main__":
    main()
