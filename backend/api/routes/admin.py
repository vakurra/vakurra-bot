from fastapi import APIRouter, Depends, HTTPException

from backend.api.dependencies.admin import get_admin_user
from backend.shared.database.models import User
from backend.shared.database.session import SessionLocal
from backend.shared.services.telegram_bot import TelegramBotService


router = APIRouter(
    prefix="/admin",
    tags=["admin"],
)


@router.get("/bots")
async def get_admin_bots(
    admin_user: User = Depends(get_admin_user),
) -> list[dict]:
    async with SessionLocal() as session:
        bot_service = TelegramBotService(session)

        bots = await bot_service.get_pending()

    return [
        {
            "id": bot.id,
            "username": bot.username,
            "name": bot.name,
            "profile_photo_url": bot.profile_photo_url,
            "submitted_by": bot.submitted_by,
            "status": bot.status,
        }
        for bot in bots
    ]


@router.post("/bots/{bot_id}/approve")
async def approve_bot(
    bot_id: int,
    admin_user: User = Depends(get_admin_user),
) -> dict:
    async with SessionLocal() as session:
        bot_service = TelegramBotService(session)

        bot = await bot_service.get_by_id(bot_id)

        if bot is None:
            raise HTTPException(
                status_code=404,
                detail="Бот не найден.",
            )

        if bot.status != "pending":
            raise HTTPException(
                status_code=409,
                detail="Заявка уже обработана.",
            )

        bot = await bot_service.update_status(
            bot_id=bot_id,
            status="approved",
        )

    return {
        "id": bot.id,
        "status": bot.status,
    }

@router.post("/bots/{bot_id}/reject")
async def reject_bot(
    bot_id: int,
    admin_user: User = Depends(get_admin_user),
) -> dict:
    async with SessionLocal() as session:
        bot_service = TelegramBotService(session)

        bot = await bot_service.get_by_id(bot_id)

        if bot is None:
            raise HTTPException(
                status_code=404,
                detail="Бот не найден.",
            )

        if bot.status != "pending":
            raise HTTPException(
                status_code=409,
                detail="Заявка уже обработана.",
            )

        bot = await bot_service.update_status(
            bot_id=bot_id,
            status="rejected",
        )

    return {
        "id": bot.id,
        "status": bot.status,
    }
    