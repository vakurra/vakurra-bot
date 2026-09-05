from backend.bot.constants import emoji
from backend.bot.keyboards.builders import get_reply_keyboard


admin_reply_kb = get_reply_keyboard(
    buttons={
        "Пользователи": (None, emoji.USERS),
        "Реклама": (None, emoji.PROMO),
    },
    sizes=(1,),
)
