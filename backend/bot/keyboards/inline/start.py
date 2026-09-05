from pathlib import Path

from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

from backend.shared.config import WEB_APP_URL
from backend.bot.constants import emoji


start_inline_kb = InlineKeyboardMarkup(
    inline_keyboard=[
        [
            InlineKeyboardButton(
                text="Войти в приложение",
                icon_custom_emoji_id=emoji.FOLLOW.custom_id,
                style="success",
                web_app=WebAppInfo(url="https://faced-marriage-enjoy-decision.trycloudflare.com"),
            )
        ]
    ]
)