from threading import Lock

_force_logout_user_ids: set[int] = set()
_lock = Lock()


def mark_user_for_forced_logout(user_id: int) -> None:
    with _lock:
        _force_logout_user_ids.add(user_id)


def mark_users_for_forced_logout(user_ids: list[int]) -> None:
    with _lock:
        _force_logout_user_ids.update(user_ids)


def clear_forced_logout(user_id: int) -> None:
    with _lock:
        _force_logout_user_ids.discard(user_id)


def is_user_forced_logged_out(user_id: int) -> bool:
    with _lock:
        return user_id in _force_logout_user_ids
