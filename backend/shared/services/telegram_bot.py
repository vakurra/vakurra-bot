from typing import Any

from sqlalchemy import delete, exists, or_, select
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

    async def get_catalog_page(
        self,
        *,
        search: str | None,
        subcategory_ids: list[int],
        limit: int,
        offset: int,
    ) -> tuple[list[tuple[TelegramBot, list[Subcategory]]], bool]:
        """
        Return one page of approved catalog bots.

        Search and category filtering are performed in the database.
        The second query loads all subcategories for the selected bots.
        """

        conditions = [TelegramBot.status == "approved"]

        normalized_search = (search or "").strip()

        if normalized_search:
            search_pattern = f"%{normalized_search}%"
            conditions.append(
                or_(
                    TelegramBot.name.ilike(search_pattern),
                    TelegramBot.username.ilike(search_pattern),
                    TelegramBot.about.ilike(search_pattern),
                    TelegramBot.description.ilike(search_pattern),
                )
            )

        if subcategory_ids:
            conditions.append(
                exists(
                    select(1)
                    .select_from(TelegramBotCategory)
                    .where(
                        TelegramBotCategory.bot_id == TelegramBot.id,
                        TelegramBotCategory.subcategory_id.in_(
                            subcategory_ids
                        ),
                    )
                )
            )

        result = await self.session.execute(
            select(TelegramBot.id)
            .where(*conditions)
            .order_by(
                TelegramBot.created_at.desc(),
                TelegramBot.id.desc(),
            )
            .offset(offset)
            .limit(limit + 1)
        )

        bot_ids = [bot_id for bot_id in result.scalars().all()]

        has_more = len(bot_ids) > limit
        page_bot_ids = bot_ids[:limit]

        if not page_bot_ids:
            return [], has_more

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
            .where(TelegramBot.id.in_(page_bot_ids))
            .order_by(
                TelegramBot.created_at.desc(),
                TelegramBot.id.desc(),
                Subcategory.id.asc(),
            )
        )

        bots_by_id: dict[int, tuple[TelegramBot, list[Subcategory]]] = {}

        for bot, subcategory, category in result.all():
            subcategory.category = category
            bots_by_id.setdefault(bot.id, (bot, []))[1].append(subcategory)

        bots = [
            bots_by_id[bot_id]
            for bot_id in page_bot_ids
            if bot_id in bots_by_id
        ]

        return bots, has_more

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
            bots_by_id.setdefault(bot.id, (bot, []))[1].append(subcategory)

        return list(bots_by_id.values())

    @staticmethod
    def _apply_bot_data(
        bot: TelegramBot,
        bot_data: dict[str, Any],
    ) -> None:
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
