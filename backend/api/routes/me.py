from aiogram.types import User as TelegramUser
from fastapi import APIRouter, Depends

from backend.api.dependencies.auth import get_telegram_user
from backend.shared.database.session import SessionLocal
from backend.shared.services.user import UserService


router = APIRouter(tags=["auth"])


@router.get("/me")
async def get_current_user(
    telegram_user: TelegramUser = Depends(get_telegram_user),
) -> dict[str, int | str | None]:
    """Return the authenticated application user."""

    async with SessionLocal() as session:
        user_service = UserService(session)

        user = await user_service.get_or_create(
            tg_user=telegram_user,
        )

    return {
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
    }