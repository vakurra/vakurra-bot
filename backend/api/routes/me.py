from aiogram.types import User as TelegramUser
from fastapi import APIRouter, Depends

from backend.api.dependencies.auth import get_telegram_user
from backend.shared.database.session import SessionLocal
from backend.shared.services.telegram_bot import TelegramBotService
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
        "role": user.role,
    }


@router.get("/me/bots")
async def get_my_bots(
    telegram_user: TelegramUser = Depends(get_telegram_user),
) -> list[dict]:
    """Return bots submitted by the authenticated user."""

    async with SessionLocal() as session:
        bot_service = TelegramBotService(session)

        bots = await bot_service.get_by_submitted_by(
            user_id=telegram_user.id,
        )

    return [
        {
            "id": bot.id,
            "username": bot.username,
            "name": bot.name,
            "profile_photo_url": bot.profile_photo_url,
            "status": bot.status,
        }
        for bot in bots
    ]
