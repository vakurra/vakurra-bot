from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from backend.shared.database.base import Base


class TelegramBotCategory(Base):
    """Связь Telegram-бота с категориями."""

    __tablename__ = "telegram_bot_categories"

    bot_id: Mapped[int] = mapped_column(
        ForeignKey("telegram_bots.id", ondelete="CASCADE"),
        primary_key=True,
    )

    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="CASCADE"),
        primary_key=True,
    )
    