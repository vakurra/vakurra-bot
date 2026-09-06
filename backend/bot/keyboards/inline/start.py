from pathlib import Path

from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

from backend.shared.config import settings # в прод брать url=settings.web_app_url
from backend.bot.constants import emoji


start_inline_kb = InlineKeyboardMarkup(
    inline_keyboard=[
        [
            InlineKeyboardButton(
                text="Войти в приложение",
                icon_custom_emoji_id=emoji.FOLLOW.custom_id,
                style="success",
                web_app=WebAppInfo(url="https://throwing-investigator-advisors-filtering.trycloudflare.com"),
            )
        ]
    ]
)