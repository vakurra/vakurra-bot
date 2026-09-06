import asyncio

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from backend.bot.middlewares.global_action import GlobalActionMiddleware
from backend.bot.middlewares.throttling import ThrottlingMiddleware
from backend.bot.middlewares.localization import LocalizationMiddleware

from backend.bot.commands import set_bot_commands
from backend.shared.config import settings
from backend.bot.handlers import get_routers
from backend.shared.database.session import engine
from backend.bot.services.text import TextService


text_service = TextService()

# Создание бота
bot = Bot(
    token=settings.bot_token,
    default=DefaultBotProperties(parse_mode=ParseMode.HTML),
)

dp = Dispatcher()
dp.message.outer_middleware(GlobalActionMiddleware())
dp.message.outer_middleware(ThrottlingMiddleware())
dp.message.outer_middleware(LocalizationMiddleware(text_service))
dp.callback_query.middleware(LocalizationMiddleware(text_service))



# Подключение роутеров команд
for router in get_routers():
    dp.include_router(router)


async def main():
    try:
        await set_bot_commands(bot)
        await dp.start_polling(bot)

    except Exception as e:
        print(f"Критическая ошибка! Бот остановлен: {e}")

    finally:
        await engine.dispose()
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
