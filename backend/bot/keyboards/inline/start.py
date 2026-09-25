from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

from backend.shared.config import settings
from backend.bot.constants import emoji


start_inline_kb = InlineKeyboardMarkup(
    inline_keyboard=[
        [
            InlineKeyboardButton(
                text="Войти в приложение",
                icon_custom_emoji_id=emoji.FOLLOW.custom_id,
                style="success",
                web_app=WebAppInfo(url=settings.web_app_url),
            )
        ]
    ]
)