# Имитация базы данных (в памяти)
books_db: dict = {}
borrow_records: dict = {}
current_id: int = 1


def get_next_id() -> int:
    """Получить следующий ID для книги"""
    global current_id
    id_ = current_id
    current_id += 1
    return id_


def book_to_response(book_id: int, book_data: dict):
    """Преобразует данные книги в модель ответа (импортируется здесь для избежания циклического импорта)"""
    from models import BookResponse
    return BookResponse(
        id=book_id,
        title=book_data["title"],
        author=book_data["author"],
        genre=book_data["genre"],
        publication_year=book_data["publication_year"],
        pages=book_data["pages"],
        isbn=book_data["isbn"],
        available=book_data.get("available", True)
    )


def reset_db():
    """Сбросить базу данных (для тестов)"""
    global current_id
    books_db.clear()
    borrow_records.clear()
    current_id = 1