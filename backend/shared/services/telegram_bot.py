from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.shared.database.models.subcategory import Subcategory
from backend.shared.database.models.telegram_bot import TelegramBot
from backend.shared.database.models.telegram_bot_category import TelegramBotCategory


class TelegramBotService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, bot_id: int) -> TelegramBot | None:
        result = await self.session.execute(
            select(TelegramBot).where(TelegramBot.id == bot_id)
        )
        return result.scalar_one_or_none()

    async def get_approved(self) -> list[TelegramBot]:
        result = await self.session.execute(
            select(TelegramBot)
            .where(TelegramBot.status == "approved")
            .order_by(TelegramBot.created_at.desc())
        )

        return list(result.scalars().all())

    async def get_approved_with_subcategories(
        self,
    ) -> list[tuple[TelegramBot, list[Subcategory]]]:
        result = await self.session.execute(
            select(
                TelegramBot,
                Subcategory,
            )
            .join(
                TelegramBotCategory,
                TelegramBotCategory.bot_id == TelegramBot.id,
            )
            .join(
                Subcategory,
                Subcategory.id == TelegramBotCategory.subcategory_id,
            )
            .where(TelegramBot.status == "approved")
            .order_by(
                TelegramBot.created_at.desc(),
                Subcategory.id.asc(),
            )
        )

        bots_by_id: dict[int, tuple[TelegramBot, list[Subcategory]]] = {}

        for bot, subcategory in result.all():
            if bot.id not in bots_by_id:
                bots_by_id[bot.id] = (bot, [])

            bots_by_id[bot.id][1].append(subcategory)

        return list(bots_by_id.values())

    async def get_pending(self) -> list[TelegramBot]:
        result = await self.session.execute(
            select(TelegramBot)
            .where(TelegramBot.status == "pending")
            .order_by(TelegramBot.created_at.asc())
        )

        return list(result.scalars().all())

    async def get_pending_with_subcategories(
        self,
    ) -> list[tuple[TelegramBot, list[Subcategory]]]:
        result = await self.session.execute(
            select(
                TelegramBot,
                Subcategory,
            )
            .join(
                TelegramBotCategory,
                TelegramBotCategory.bot_id == TelegramBot.id,
            )
            .join(
                Subcategory,
                Subcategory.id == TelegramBotCategory.subcategory_id,
            )
            .where(TelegramBot.status == "pending")
            .order_by(
                TelegramBot.created_at.asc(),
                Subcategory.id.asc(),
            )
        )

        bots_by_id: dict[int, tuple[TelegramBot, list[Subcategory]]] = {}

        for bot, subcategory in result.all():
            if bot.id not in bots_by_id:
                bots_by_id[bot.id] = (bot, [])

            bots_by_id[bot.id][1].append(subcategory)

        return list(bots_by_id.values())

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

    async def get_subcategories_by_ids(
        self,
        subcategory_ids: list[int],
    ) -> list[Subcategory]:
        result = await self.session.execute(
            select(Subcategory)
            .where(Subcategory.id.in_(subcategory_ids))
            .order_by(Subcategory.id)
        )

        return list(result.scalars().all())

    async def create(
        self,
        bot_data: dict,
        submitted_by: int,
        subcategories: list[Subcategory],
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

        bot.subcategories = subcategories

        self.session.add(bot)
        await self.session.commit()
        await self.session.refresh(bot)

        return bot

    async def update_status(
        self,
        bot_id: int,
        status: str,
        rejection_reason: str | None = None,
    ) -> TelegramBot | None:
        bot = await self.get_by_id(bot_id)

        if bot is None:
            return None

        bot.status = status
        bot.rejection_reason = rejection_reason

        await self.session.commit()
        await self.session.refresh(bot)

        return bot

    async def resubmit(
        self,
        bot: TelegramBot,
        bot_data: dict,
        submitted_by: int,
        subcategories: list[Subcategory],
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
        bot.rejection_reason = None

        await self.session.execute(
            delete(TelegramBotCategory).where(
                TelegramBotCategory.bot_id == bot.id
            )
        )

        self.session.add_all(
            [
                TelegramBotCategory(
                    bot_id=bot.id,
                    subcategory_id=subcategory.id,
                )
                for subcategory in subcategories
            ]
        )

        await self.session.commit()
        await self.session.refresh(bot)

        return bot
