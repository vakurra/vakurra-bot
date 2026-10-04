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

class BotSubmitRequest(BaseModel):
    username: str
    subcategory_ids: list[int]


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


class BotCatalogResponse(BaseModel):
    username: str
    name: str
    about: str | None
    description: str | None
    mau: int | None
    verified: bool
    has_main_app: bool
    menu_web_app_url: str | None
    profile_photo_url: str | None
    subcategories: list[dict]


@router.get("", response_model=list[BotCatalogResponse])
async def get_catalog_bots() -> list[BotCatalogResponse]:
    async with SessionLocal() as session:
        bot_service = TelegramBotService(session)
        bots = await bot_service.get_approved_with_subcategories()

    return [
        BotCatalogResponse(
            username=bot.username,
            name=bot.name,
            about=bot.about,
            description=bot.description,
            mau=bot.mau,
            verified=bot.verified,
            has_main_app=bot.has_main_app,
            menu_web_app_url=bot.menu_web_app_url,
            profile_photo_url=bot.profile_photo_url,
            subcategories=[
                {
                    "id": subcategory.id,
                    "name": subcategory.name,
                }
                for subcategory in subcategories
            ],
        )
        for bot, subcategories in bots
    ]


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
        if existing_bot.status == "pending":
            raise HTTPException(
                status_code=409,
                detail="Этот бот уже отправлен на модерацию.",
            )

        if existing_bot.status == "approved":
            raise HTTPException(
                status_code=409,
                detail="Этот бот уже опубликован в каталоге.",
            )

    if bot_data["profile_photo_url"]:
        filename = bot_data["profile_photo_url"].split("/bots/")[-1]
        bot_data["profile_photo_url"] = f"/media/bots/{filename}"

    return BotPreviewResponse(**bot_data)


@router.post("/submit", response_model=BotSubmitResponse, status_code=201)
async def submit_bot(
    data: BotSubmitRequest,
    request: Request,
    telegram_user: TelegramUser = Depends(get_telegram_user),
) -> BotSubmitResponse:
    username = data.username.strip().lstrip("@")

    if not username:
        raise HTTPException(
            status_code=400,
            detail="Username бота не указан.",
        )

    if not 1 <= len(data.subcategory_ids) <= 3:
        raise HTTPException(
            status_code=400,
            detail="Нужно выбрать от 1 до 3 подкатегорий.",
        )

    if len(data.subcategory_ids) != len(set(data.subcategory_ids)):
        raise HTTPException(
            status_code=400,
            detail="Подкатегории не должны повторяться.",
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

        subcategories = await bot_service.get_subcategories_by_ids(
            data.subcategory_ids
        )

        if len(subcategories) != len(data.subcategory_ids):
            raise HTTPException(
                status_code=400,
                detail="Одна или несколько выбранных подкатегорий не существуют.",
            )

        existing_bot = await bot_service.get_by_id(bot_data["id"])

        if existing_bot is not None:
            if existing_bot.status == "pending":
                raise HTTPException(
                    status_code=409,
                    detail="Этот бот уже отправлен на модерацию.",
                )

            if existing_bot.status == "approved":
                raise HTTPException(
                    status_code=409,
                    detail="Этот бот уже опубликован в каталоге.",
                )

            if existing_bot.status == "rejected":
                bot = await bot_service.resubmit(
                    bot=existing_bot,
                    bot_data=bot_data,
                    submitted_by=telegram_user.id,
                    subcategories=subcategories,
                )

                return BotSubmitResponse(
                    id=bot.id,
                    status=bot.status,
                )

        bot = await bot_service.create(
            bot_data=bot_data,
            submitted_by=telegram_user.id,
            subcategories=subcategories,
        )

    return BotSubmitResponse(
        id=bot.id,
        status=bot.status,
    )
