from aiogram.types import User as TelegramUser
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel

from backend.api.dependencies.auth import get_telegram_user
from backend.shared.database.session import SessionLocal
from backend.shared.services.telegram_bot import TelegramBotService
from backend.telegram.parser import InvalidTelegramUsernameError


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


class BotCatalogPageResponse(BaseModel):
    items: list[BotCatalogResponse]
    has_more: bool


def _normalize_username(username: str) -> str:
    return username.strip().lstrip("@")


def _prepare_bot_data(bot_data: dict) -> dict:
    if bot_data["profile_photo_url"]:
        filename = bot_data["profile_photo_url"].split("/bots/")[-1]
        bot_data["profile_photo_url"] = f"/media/bots/{filename}"
    return bot_data


def _ensure_bot_can_be_submitted(bot) -> None:
    if bot is None or bot.status == "rejected":
        return

    if bot.status == "pending":
        raise HTTPException(
            status_code=409,
            detail="Этот бот уже отправлен на модерацию.",
        )

    if bot.status == "approved":
        raise HTTPException(
            status_code=409,
            detail="Этот бот уже опубликован в каталоге.",
        )


async def _load_bot_data(request: Request, username: str) -> dict:
    parser = request.app.state.telegram_parser

    try:
        bot_data = await parser.get_bot(username)
    except InvalidTelegramUsernameError as error:
        raise HTTPException(
            status_code=400,
            detail="Некорректный username Telegram.",
        ) from error

    if bot_data is None:
        raise HTTPException(
            status_code=404,
            detail="Telegram-бот не найден.",
        )

    return _prepare_bot_data(bot_data)


@router.get("", response_model=BotCatalogPageResponse)
async def get_catalog_bots(
    search: str | None = None,
    subcategory_ids: list[int] | None = Query(default=None),
    limit: int = 25,
    offset: int = 0,
) -> BotCatalogPageResponse:
    if not 1 <= limit <= 100:
        raise HTTPException(
            status_code=400,
            detail="Limit должен быть от 1 до 100.",
        )

    if offset < 0:
        raise HTTPException(
            status_code=400,
            detail="Offset не может быть отрицательным.",
        )

    async with SessionLocal() as session:
        bot_service = TelegramBotService(session)

        bots, has_more = await bot_service.get_catalog_page(
            search=search,
            subcategory_ids=subcategory_ids or [],
            limit=limit,
            offset=offset,
        )

    return BotCatalogPageResponse(
        items=[
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
                        "category_id": subcategory.category_id,
                        "category_name": subcategory.category.name,
                    }
                    for subcategory in subcategories
                ],
            )
            for bot, subcategories in bots
        ],
        has_more=has_more,
    )


@router.post("/preview", response_model=BotPreviewResponse)
async def preview_bot(
    data: BotPreviewRequest,
    request: Request,
    telegram_user: TelegramUser = Depends(get_telegram_user),
) -> BotPreviewResponse:
    username = _normalize_username(data.username)

    if not username:
        raise HTTPException(
            status_code=400,
            detail="Username бота не указан.",
        )

    bot_data = await _load_bot_data(request, username)

    async with SessionLocal() as session:
        bot_service = TelegramBotService(session)
        existing_bot = await bot_service.get_by_id(bot_data["id"])

    _ensure_bot_can_be_submitted(existing_bot)

    return BotPreviewResponse(**bot_data)


@router.post("/submit", response_model=BotSubmitResponse, status_code=201)
async def submit_bot(
    data: BotSubmitRequest,
    request: Request,
    telegram_user: TelegramUser = Depends(get_telegram_user),
) -> BotSubmitResponse:
    username = _normalize_username(data.username)

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

    bot_data = await _load_bot_data(request, username)

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
            _ensure_bot_can_be_submitted(existing_bot)

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
