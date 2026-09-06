from aiogram.types import User as TelegramUser
from aiogram.utils.web_app import safe_parse_webapp_init_data
from fastapi import Header, HTTPException

from backend.shared.config import settings


def get_telegram_user(
    authorization: str | None = Header(default=None),
) -> TelegramUser:
    """Validate Telegram Mini App initData and return the Telegram user."""

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header отсутствует.",
        )

    scheme, _, init_data = authorization.partition(" ")

    if scheme.lower() != "tma" or not init_data:
        raise HTTPException(
            status_code=401,
            detail="Некорректный Authorization header.",
        )

    if settings.bot_token is None:
        raise HTTPException(
            status_code=500,
            detail="BOT_TOKEN не настроен.",
        )

    try:
        data = safe_parse_webapp_init_data(
            token=settings.bot_token,
            init_data=init_data,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=401,
            detail="Некорректные Telegram initData.",
        ) from error

    if data.user is None:
        raise HTTPException(
            status_code=401,
            detail="Telegram user отсутствует в initData.",
        )

    return data.user
    