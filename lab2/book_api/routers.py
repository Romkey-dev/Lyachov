from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import date, timedelta

from models import BookCreate, BookResponse, BookUpdate, BorrowRequest, BookDetailResponse, Genre
from database import books_db, borrow_records, get_next_id, book_to_response

router = APIRouter()


# GET /books - получение списка всех книг с фильтрацией
@router.get("/books", response_model=List[BookResponse])
async def get_books(
    genre: Optional[Genre] = Query(None, description="Фильтр по жанру"),
    author: Optional[str] = Query(None, description="Фильтр по автору"),
    available_only: bool = Query(False, description="Только доступные книги"),
    skip: int = Query(0, ge=0, description="Количество книг для пропуска"),
    limit: int = Query(100, ge=1, le=1000, description="Лимит книг на странице")
):
    """
    Получить список книг с возможностью фильтрации.
    """
    filtered_books = []
    
    for book_id, book_data in books_db.items():
        # Фильтрация по genre
        if genre is not None and book_data["genre"] != genre:
            continue
        
        # Фильтрация по author (регистронезависимый поиск)
        if author is not None and author.lower() not in book_data["author"].lower():
            continue
        
        # Фильтрация по available_only
        if available_only and not book_data.get("available", True):
            continue
        
        # Если книга проходит все фильтры, добавляем её
        filtered_books.append(book_to_response(book_id, book_data))
    
    # Пагинация (skip и limit)
    paginated_books = filtered_books[skip:skip + limit]
    
    return paginated_books


# GET /books/{book_id} - получение книги по ID
@router.get("/books/{book_id}", response_model=BookDetailResponse)
async def get_book(book_id: int):
    """
    Получить информацию о книге по её ID.
    """
    # Проверяем, существует ли книга с таким ID
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Книга с таким ID не найдена")
    
    book_data = books_db[book_id]
    response = BookDetailResponse(
        id=book_id,
        title=book_data["title"],
        author=book_data["author"],
        genre=book_data["genre"],
        publication_year=book_data["publication_year"],
        pages=book_data["pages"],
        isbn=book_data["isbn"],
        available=book_data.get("available", True)
    )
    
    # Если книга взята, добавляем информацию о заимствовании
    if book_id in borrow_records:
        borrow_info = borrow_records[book_id]
        response.borrowed_by = borrow_info.get("borrower_name")
        response.borrowed_date = borrow_info.get("borrowed_date")
        response.return_date = borrow_info.get("return_date")
    
    return response


# POST /books - создание новой книги
@router.post("/books", response_model=BookResponse, status_code=201)
async def create_book(book: BookCreate):
    """
    Создать новую книгу в библиотеке.
    """
    # Проверяем, нет ли уже книги с таким ISBN
    for existing_book_id, existing_book_data in books_db.items():
        if existing_book_data["isbn"] == book.isbn:
            raise HTTPException(status_code=400, detail="Книга с таким ISBN уже существует")
    
    book_id = get_next_id()
    
    # Сохраняем книгу в books_db
    books_db[book_id] = {
        "title": book.title,
        "author": book.author,
        "genre": book.genre,
        "publication_year": book.publication_year,
        "pages": book.pages,
        "isbn": book.isbn,
        "available": True
    }
    
    return book_to_response(book_id, books_db[book_id])


# PUT /books/{book_id} - полное обновление книги
@router.put("/books/{book_id}", response_model=BookResponse)
async def update_book(book_id: int, book_update: BookUpdate):
    """
    Обновить информацию о книге.
    """
    # Проверяем, существует ли книга с таким ID
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Книга с таким ID не найдена")
    
    # Получаем текущие данные книги
    current_book = books_db[book_id]
    
    # Получаем только переданные поля
    update_data = book_update.model_dump(exclude_unset=True)
    
    # Если передается ISBN, проверяем его уникальность
    if "isbn" in update_data:
        for existing_book_id, existing_book_data in books_db.items():
            if existing_book_id != book_id and existing_book_data["isbn"] == update_data["isbn"]:
                raise HTTPException(status_code=400, detail="Книга с таким ISBN уже существует")
    
    # Обновляем только переданные поля
    for key, value in update_data.items():
        current_book[key] = value
    
    # Сохраняем обновленную книгу
    books_db[book_id] = current_book
    
    return book_to_response(book_id, books_db[book_id])


# DELETE /books/{book_id} - удаление книги
@router.delete("/books/{book_id}", status_code=204)
async def delete_book(book_id: int):
    """
    Удалить книгу из библиотеки.
    """
    # Проверяем, существует ли книга с таким ID
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Книга с таким ID не найдена")
    
    # Проверяем, не взята ли книга (available=False)
    if not books_db[book_id].get("available", True):
        raise HTTPException(status_code=400, detail="Нельзя удалить книгу, которая сейчас взята")
    
    # Удаляем книгу из books_db
    del books_db[book_id]
    
    # Если есть запись о заимствовании, удаляем и её
    if book_id in borrow_records:
        del borrow_records[book_id]
    
    return None


# POST /books/{book_id}/borrow - заимствование книги
@router.post("/books/{book_id}/borrow", response_model=BookDetailResponse)
async def borrow_book(book_id: int, borrow_request: BorrowRequest):
    """
    Взять книгу из библиотеки.
    """
    # Проверяем, существует ли книга с таким ID
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Книга с таким ID не найдена")
    
    # Проверяем, доступна ли книга (available=True)
    if not books_db[book_id].get("available", True):
        raise HTTPException(status_code=400, detail="Книга уже взята")
    
    # Обновляем статус книги на недоступную
    books_db[book_id]["available"] = False
    
    # Создаем запись о заимствовании в borrow_records
    borrowed_date = date.today()
    return_date = borrowed_date + timedelta(days=borrow_request.return_days)
    
    borrow_records[book_id] = {
        "borrower_name": borrow_request.borrower_name,
        "borrowed_date": borrowed_date,
        "return_date": return_date
    }
    
    # Возвращаем обновленную информацию о книге с деталями заимствования
    book_data = books_db[book_id]
    response = BookDetailResponse(
        id=book_id,
        title=book_data["title"],
        author=book_data["author"],
        genre=book_data["genre"],
        publication_year=book_data["publication_year"],
        pages=book_data["pages"],
        isbn=book_data["isbn"],
        available=book_data.get("available", True),
        borrowed_by=borrow_request.borrower_name,
        borrowed_date=borrowed_date,
        return_date=return_date
    )
    
    return response


# POST /books/{book_id}/return - возврат книги
@router.post("/books/{book_id}/return", response_model=BookResponse)
async def return_book(book_id: int):
    """
    Вернуть книгу в библиотеку.
    """
    # Проверяем, существует ли книга с таким ID
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Книга с таким ID не найдена")
    
    # Проверяем, взята ли книга (available=False)
    if books_db[book_id].get("available", True):
        raise HTTPException(status_code=400, detail="Книга не была взята")
    
    # Обновляем статус книги на доступную
    books_db[book_id]["available"] = True
    
    # Удаляем запись о заимствовании из borrow_records
    if book_id in borrow_records:
        del borrow_records[book_id]
    
    # Возвращаем обновленную информацию о книге
    return book_to_response(book_id, books_db[book_id])


# GET /stats - статистика библиотеки
@router.get("/stats")
async def get_library_stats():
    """
    Получить статистику библиотеки.
    """
    stats = {
        "total_books": 0,
        "available_books": 0,
        "borrowed_books": 0,
        "books_by_genre": {},
        "most_prolific_author": None
    }
    
    # 1. Общее количество книг
    stats["total_books"] = len(books_db)
    
    # 2. Количество доступных книг
    # 3. Количество взятых книг
    for book_data in books_db.values():
        if book_data.get("available", True):
            stats["available_books"] += 1
        else:
            stats["borrowed_books"] += 1
        
        # 4. Распределение книг по жанрам
        genre = book_data["genre"]
        if genre not in stats["books_by_genre"]:
            stats["books_by_genre"][genre] = 0
        stats["books_by_genre"][genre] += 1
    
    # 5. Автор с наибольшим количеством книг
    author_counts = {}
    for book_data in books_db.values():
        author = book_data["author"]
        if author not in author_counts:
            author_counts[author] = 0
        author_counts[author] += 1
    
    if author_counts:
        stats["most_prolific_author"] = max(author_counts, key=author_counts.get)
    
    return stats