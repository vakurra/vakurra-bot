from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.shared.database.models.category import Category
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
        return await self._get_by_status("approved", descending=True)

    async def get_approved_with_subcategories(
        self,
    ) -> list[tuple[TelegramBot, list[Subcategory]]]:
        return await self._get_with_subcategories("approved", descending=True)

    async def get_pending(self) -> list[TelegramBot]:
        return await self._get_by_status("pending", descending=False)

    async def get_pending_with_subcategories(
        self,
    ) -> list[tuple[TelegramBot, list[Subcategory]]]:
        return await self._get_with_subcategories("pending", descending=False)

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
            submitted_by=submitted_by,
            status="pending",
        )
        self._apply_bot_data(bot, bot_data)

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
        self._apply_bot_data(bot, bot_data)
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

    async def _get_by_status(
        self,
        status: str,
        *,
        descending: bool,
    ) -> list[TelegramBot]:
        created_at = (
            TelegramBot.created_at.desc()
            if descending
            else TelegramBot.created_at.asc()
        )
        result = await self.session.scalars(
            select(TelegramBot)
            .where(TelegramBot.status == status)
            .order_by(created_at)
        )
        return list(result.all())

    async def _get_with_subcategories(
        self,
        status: str,
        *,
        descending: bool,
    ) -> list[tuple[TelegramBot, list[Subcategory]]]:
        created_at = (
            TelegramBot.created_at.desc()
            if descending
            else TelegramBot.created_at.asc()
        )

        result = await self.session.execute(
            select(TelegramBot, Subcategory, Category)
            .join(
                TelegramBotCategory,
                TelegramBotCategory.bot_id == TelegramBot.id,
            )
            .join(
                Subcategory,
                Subcategory.id == TelegramBotCategory.subcategory_id,
            )
            .join(
                Category,
                Category.id == Subcategory.category_id,
            )
            .where(TelegramBot.status == status)
            .order_by(created_at, Subcategory.id.asc())
        )

        bots_by_id: dict[int, tuple[TelegramBot, list[Subcategory]]] = {}

        for bot, subcategory, category in result.all():
            subcategory.category = category

            bots_by_id.setdefault(
                bot.id,
                (bot, []),
            )[1].append(subcategory)

        return list(bots_by_id.values())

    @staticmethod
    def _apply_bot_data(bot: TelegramBot, bot_data: dict[str, Any]) -> None:
        for field in (
            "username",
            "name",
            "about",
            "description",
            "mau",
            "verified",
            "restricted",
            "scam",
            "fake",
            "has_main_app",
            "menu_web_app_url",
            "profile_photo_url",
        ):
            setattr(bot, field, bot_data[field])
