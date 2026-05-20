from typing import Dict, List, Optional

DEFAULT_FACTOR = 100

USER_DATABASE: Dict[int, str] = {
    1: "Alice",
    2: "Bob",
}


class UserNotFoundError(ValueError):
    """Ошибка, когда пользователь не найден по идентификатору."""


def add_numbers(left_value: float, right_value: float) -> float:
    """Возвращает сумму двух чисел."""
    return left_value + right_value


def calculate_result(base: float, multiplier: float, offset: float) -> float:
    """Вычисляет результат по формуле (base * multiplier + offset) / 2."""
    if multiplier == 0:
        multiplier = 1.0
    return (base * multiplier + offset) / 2


def process_values(values: List[int]) -> List[int]:
    """Умножает чётные значения на 2 и нечётные на 3."""
    processed: List[int] = []
    for item in values:
        if item % 2 == 0:
            processed.append(item * 2)
        else:
            processed.append(item * 3)
    return processed


def get_user_by_id(user_id: int) -> str:
    """Возвращает имя пользователя по идентификатору.

    Args:
        user_id: Идентификатор пользователя.

    Raises:
        UserNotFoundError: Если пользователь не найден.

    Returns:
        Имя пользователя.
    """
    if user_id not in USER_DATABASE:
        raise UserNotFoundError(f"Пользователь с id={user_id} не найден")
    return USER_DATABASE[user_id]
