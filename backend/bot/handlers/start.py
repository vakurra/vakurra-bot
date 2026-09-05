from aiogram import F, Router
from aiogram.filters import Command
from aiogram.types import Message

from backend.bot.services.bot.text import TextService
from backend.shared.database.session import SessionLocal
from backend.bot.keyboards.inline.start import start_inline_kb
from backend.bot.services.db.user import UserService
from backend.bot.services.db.ad import AdService


start_router = Router()


@start_router.message(Command("start"))
async def start_command(message: Message, text: TextService):
    """Регистрирует пользователя и открывает каталог."""

    async with SessionLocal() as session:
        user_service = UserService(session)
        user = await user_service.get_by_id(message.from_user.id)
        name = message.from_user.first_name
        is_new = user is None

        referred_by = None

        if not user and message.text:
            parts = message.text.split(maxsplit=1)

            if len(parts) == 2:
                campaign_name = parts[1].strip()

                ad_service = AdService(session)
                ad = await ad_service.get_by_campaign_name(campaign_name)

                if ad:
                    referred_by = ad.campaign_name

        if not user:
            user = await user_service.create(
                tg_user=message.from_user,
                referred_by=referred_by,
            )

    await message.answer(
        text("start-welcome" if is_new else "start-return", name=name),
        reply_markup=start_inline_kb,
    )

