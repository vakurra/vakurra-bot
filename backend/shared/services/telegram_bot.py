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

    async def get_pending(self) -> list[TelegramBot]:
        result = await self.session.execute(
            select(TelegramBot)
            .where(TelegramBot.status == "pending")
            .order_by(TelegramBot.created_at.asc())
        )

        return list(result.scalars().all())

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

    async def update_status(
        self,
        bot_id: int,
        status: str,
    ) -> TelegramBot | None:
        bot = await self.get_by_id(bot_id)

        if bot is None:
            return None

        bot.status = status

        await self.session.commit()
        await self.session.refresh(bot)

        return bot

    async def resubmit(
        self,
        bot: TelegramBot,
        bot_data: dict,
        submitted_by: int,
    ) -> TelegramBot:
        bot.username = bot_data["username"]
        bot.name = bot_data["name"]
        bot.about = bot_data["about"]
        bot.description = bot_data["description"]
        bot.mau = bot_data["mau"]
        bot.verified = bot_data["verified"]
        bot.restricted = bot_data["restricted"]
        bot.scam = bot_data["scam"]
        bot.fake = bot_data["fake"]
        bot.has_main_app = bot_data["has_main_app"]
        bot.menu_web_app_url = bot_data["menu_web_app_url"]
        bot.profile_photo_url = bot_data["profile_photo_url"]
        bot.submitted_by = submitted_by
        bot.status = "pending"

        await self.session.commit()
        await self.session.refresh(bot)

        return bot