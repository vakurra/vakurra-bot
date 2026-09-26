from aiogram.types import User as TelegramUser
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from backend.api.dependencies.auth import get_telegram_user
from backend.shared.database.session import SessionLocal
from backend.shared.services.telegram_bot import TelegramBotService


router = APIRouter(
    prefix="/bots",
    tags=["bots"],
)

class BotSubmitResponse(BaseModel):
    id: int
    status: str

class BotPreviewRequest(BaseModel):
    username: str

class BotPreviewResponse(BaseModel):
    id: int
    username: str
    name: str
    about: str | None
    description: str | None
    mau: int | None
    verified: bool
    restricted: bool
    scam: bool
    fake: bool
    has_main_app: bool
    menu_web_app_url: str | None
    profile_photo_url: str | None


@router.post("/preview", response_model=BotPreviewResponse)
async def preview_bot(
    data: BotPreviewRequest,
    request: Request,
    telegram_user: TelegramUser = Depends(get_telegram_user),
) -> BotPreviewResponse:
    username = data.username.strip().lstrip("@")

    if not username:
        raise HTTPException(
            status_code=400,
            detail="Username бота не указан.",
        )

    parser = request.app.state.telegram_parser

    bot_data = await parser.get_bot(username)

    if bot_data is None:
        raise HTTPException(
            status_code=404,
            detail="Telegram-бот не найден.",
        )

    async with SessionLocal() as session:
        bot_service = TelegramBotService(session)
        existing_bot = await bot_service.get_by_id(bot_data["id"])

    if existing_bot is not None:
        raise HTTPException(
            status_code=409,
            detail="Этот бот уже есть в каталоге.",
        )

    if bot_data["profile_photo_url"]:
        filename = bot_data["profile_photo_url"].split("/bots/")[-1]
        bot_data["profile_photo_url"] = f"/media/bots/{filename}"

    return BotPreviewResponse(**bot_data)


@router.post("/submit", response_model=BotSubmitResponse, status_code=201)
async def submit_bot(
    data: BotPreviewRequest,
    request: Request,
    telegram_user: TelegramUser = Depends(get_telegram_user),
) -> BotSubmitResponse:
    username = data.username.strip().lstrip("@")

    if not username:
        raise HTTPException(
            status_code=400,
            detail="Username бота не указан.",
        )

    parser = request.app.state.telegram_parser

    bot_data = await parser.get_bot(username)

    if bot_data is None:
        raise HTTPException(
            status_code=404,
            detail="Telegram-бот не найден.",
        )

    if bot_data["profile_photo_url"]:
        filename = bot_data["profile_photo_url"].split("/bots/")[-1]
        bot_data["profile_photo_url"] = f"/media/bots/{filename}"

    async with SessionLocal() as session:
        bot_service = TelegramBotService(session)

        existing_bot = await bot_service.get_by_id(bot_data["id"])

        if existing_bot is not None:
            raise HTTPException(
                status_code=409,
                detail="Этот бот уже есть в каталоге.",
            )

        bot = await bot_service.create(
            bot_data=bot_data,
            submitted_by=telegram_user.id,
        )

    return BotSubmitResponse(
        id=bot.id,
        status=bot.status,
    )
