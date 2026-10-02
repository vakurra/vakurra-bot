from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from backend.shared.database.base import Base


class TelegramBotCategory(Base):
    __tablename__ = "telegram_bot_categories"

    bot_id: Mapped[int] = mapped_column(
        ForeignKey("telegram_bots.id", ondelete="CASCADE"),
        primary_key=True,
    )

    subcategory_id: Mapped[int] = mapped_column(
        ForeignKey("subcategories.id", ondelete="CASCADE"),
        primary_key=True,
    )
    