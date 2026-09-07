from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.shared.database.base import Base


class Category(Base):
    """Категории Telegram-ботов."""

    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        nullable=False,
    )

    bots: Mapped[list["TelegramBot"]] = relationship(
        secondary="telegram_bot_categories",
        back_populates="categories",
    )
    