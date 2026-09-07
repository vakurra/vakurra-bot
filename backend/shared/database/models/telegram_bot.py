from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from backend.shared.database.base import Base


class TelegramBot(Base):
    """Telegram-бот в каталоге Vakurra."""

    __tablename__ = "telegram_bots"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
    )

    username: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    about: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    mau: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    restricted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    scam: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    fake: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    has_main_app: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    menu_web_app_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    profile_photo_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    submitted_by: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(16),
        default="pending",
        nullable=False,
    )

    categories: Mapped[list["Category"]] = relationship(
        secondary="telegram_bot_categories",
        back_populates="bots",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    