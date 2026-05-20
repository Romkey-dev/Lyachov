import re
import time
from functools import wraps
from typing import Any, Callable, Dict, List, TypeVar

T = TypeVar("T")

EMAIL_PATTERN = re.compile(
    r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
)


def validate_email(email: str) -> bool:
    """Проверяет корректность email-адреса."""
    if not isinstance(email, str) or not email:
        return False

    if not EMAIL_PATTERN.match(email):
        return False

    domain = email.split("@")[-1].lower()
    if "." not in domain or domain.startswith(".") or domain.endswith("."):
        return False

    banned_domains = {"example.com", "test.com", "invalid"}
    if domain in banned_domains:
        return False

    return True


def sort_by_key(
    data: List[Dict[str, Any]], key: str, reverse: bool = False
) -> List[Dict[str, Any]]:
    """Сортирует список словарей по заданному ключу."""
    return sorted(
        data,
        key=lambda item: item.get(key, ""),
        reverse=reverse,
    )


def timer(func: Callable[..., T]) -> Callable[..., T]:
    """Декоратор для измерения времени выполнения функции."""

    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> T:
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        elapsed = end - start
        print(f"[timer] {func.__name__} выполнена за {elapsed:.6f} секунд")
        return result

    return wrapper
