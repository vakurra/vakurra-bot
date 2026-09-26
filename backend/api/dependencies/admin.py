from fastapi import Depends, HTTPException

from aiogram.types import User as TelegramUser

from backend.api.dependencies.auth import get_telegram_user
from backend.shared.database.models import User, UserRole
from backend.shared.database.session import SessionLocal
from backend.shared.services.user import UserService


async def get_admin_user(
    telegram_user: TelegramUser = Depends(get_telegram_user),
) -> User:
    async with SessionLocal() as session:
        user_service = UserService(session)

        user = await user_service.get_by_id(telegram_user.id)

    if user is None or user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Недостаточно прав.",
        )

    return user
    