from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .database import get_db
from .models import Book

router = APIRouter(prefix="/api/v1")


@router.get("/books")
def list_books(db: Session = Depends(get_db)):
    books = db.query(Book).all()
    return [ {"id": b.id, "title": b.title, "author": b.author} for b in books ]
