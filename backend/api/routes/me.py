from aiogram.types import User as TelegramUser
from fastapi import APIRouter, Depends, HTTPException, Query

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
    limit: int = Query(default=25, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    telegram_user: TelegramUser = Depends(get_telegram_user),
) -> dict:
    """Return one page of bots submitted by the authenticated user."""

    async with SessionLocal() as session:
        bot_service = TelegramBotService(session)

        bots, has_more = await bot_service.get_submitted_by_page(
            user_id=telegram_user.id,
            limit=limit,
            offset=offset,
        )

    return {
        "items": [
            {
                "id": bot.id,
                "username": bot.username,
                "name": bot.name,
                "profile_photo_url": bot.profile_photo_url,
                "status": bot.status,
                "rejection_reason": bot.rejection_reason,
            }
            for bot in bots
        ],
        "has_more": has_more,
    }
    