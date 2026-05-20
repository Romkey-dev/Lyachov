import pytest
from generated_code import validate_email, sort_by_key, timer
from refactored_code import (
    USER_DATABASE,
    UserNotFoundError,
    add_numbers,
    calculate_result,
    get_user_by_id,
    process_values,
)


def test_add_numbers_returns_sum() -> None:
    assert add_numbers(1.5, 2.5) == 4.0


def test_calculate_result_with_nonzero_multiplier() -> None:
    assert calculate_result(4.0, 2.0, 2.0) == 5.0


def test_calculate_result_with_zero_multiplier_uses_default() -> None:
    assert calculate_result(4.0, 0.0, 2.0) == 3.0


def test_process_values_transforms_list() -> None:
    assert process_values([1, 2, 3, 4]) == [3, 4, 9, 8]


def test_get_user_by_id_returns_name() -> None:
    USER_DATABASE[3] = "Charlie"
    assert get_user_by_id(3) == "Charlie"


def test_get_user_by_id_raises_error_for_unknown_id() -> None:
    with pytest.raises(UserNotFoundError):
        get_user_by_id(-1)


@pytest.mark.parametrize(
    "email,expected",
    [
        ("user@example.org", True),
        ("invalid-email", False),
        ("user@invalid", False),
        ("test@ex ample.com", False),
    ],
)
def test_validate_email(email: str, expected: bool) -> None:
    assert validate_email(email) is expected


def test_sort_by_key_orders_data() -> None:
    data = [
        {"name": "b"},
        {"name": "a"},
        {"name": "c"},
    ]
    assert sort_by_key(data, "name") == [
        {"name": "a"},
        {"name": "b"},
        {"name": "c"},
    ]
    assert sort_by_key(data, "name", reverse=True) == [
        {"name": "c"},
        {"name": "b"},
        {"name": "a"},
    ]


def test_timer_decorator_preserves_result(capfd: pytest.CaptureFixture[str]) -> None:
    @timer
    def slow_sum(x: int, y: int) -> int:
        return x + y

    result = slow_sum(2, 3)
    assert result == 5
    captured = capfd.readouterr()
    assert "slow_sum выполнена за" in captured.out
