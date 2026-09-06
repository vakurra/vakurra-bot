from datetime import datetime, timedelta, timezone

from aiogram.types import User as TgUser
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.shared.database.models import User, UserRole


class UserService:
    """Сервис для работы с пользователями."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: int) -> User | None:
        """Возвращает пользователя по Telegram ID."""

        return await self.session.scalar(
            select(User).where(User.id == user_id)
        )

    async def get_all(self) -> list[User]:
        """Возвращает всех пользователей."""

        stmt = select(User).order_by(User.created_at.desc())
        result = await self.session.scalars(stmt)

        return list(result.all())

    async def get_new(self, days: int) -> list[User]:
        """Возвращает пользователей, зарегистрированных за последние N дней."""

        since = (
            datetime.now(timezone.utc).replace(tzinfo=None)
            - timedelta(days=days)
        )

        stmt = (
            select(User)
            .where(User.created_at >= since)
            .order_by(User.created_at.desc())
        )

        result = await self.session.scalars(stmt)

        return list(result.all())

    async def get_admins(self) -> list[User]:
        """Возвращает всех администраторов."""

        stmt = select(User).where(User.role == UserRole.ADMIN)
        result = await self.session.scalars(stmt)

        return list(result.all())

    async def create(
        self,
        tg_user: TgUser,
        referred_by: str | None = None,
    ) -> User:
        """Создает нового пользователя."""

        user = User(
            id=tg_user.id,
            username=tg_user.username,
            first_name=tg_user.first_name,
            referred_by=referred_by,
        )

        self.session.add(user)
        await self.session.commit()

        return user

    async def get_or_create(
        self,
        tg_user: TgUser,
        referred_by: str | None = None,
    ) -> User:
        """Возвращает существующего пользователя или создает нового."""

        user = await self.get_by_id(tg_user.id)

        if user is not None:
            return user

        return await self.create(
            tg_user=tg_user,
            referred_by=referred_by,
        )