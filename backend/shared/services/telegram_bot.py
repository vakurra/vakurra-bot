from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.shared.database.models.telegram_bot import TelegramBot


class TelegramBotService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, bot_id: int) -> TelegramBot | None:
        result = await self.session.execute(
            select(TelegramBot).where(TelegramBot.id == bot_id)
        )
        return result.scalar_one_or_none()

    async def get_by_submitted_by(
        self,
        user_id: int,
    ) -> list[TelegramBot]:
        result = await self.session.execute(
            select(TelegramBot)
            .where(TelegramBot.submitted_by == user_id)
            .order_by(TelegramBot.created_at.desc())
        )

        return list(result.scalars().all())

    async def create(
        self,
        bot_data: dict,
        submitted_by: int,
    ) -> TelegramBot:
        bot = TelegramBot(
            id=bot_data["id"],
            username=bot_data["username"],
            name=bot_data["name"],
            about=bot_data["about"],
            description=bot_data["description"],
            mau=bot_data["mau"],
            verified=bot_data["verified"],
            restricted=bot_data["restricted"],
            scam=bot_data["scam"],
            fake=bot_data["fake"],
            has_main_app=bot_data["has_main_app"],
            menu_web_app_url=bot_data["menu_web_app_url"],
            profile_photo_url=bot_data["profile_photo_url"],
            submitted_by=submitted_by,
            status="pending",
        )

        self.session.add(bot)
        await self.session.commit()
        await self.session.refresh(bot)

        return bot
        