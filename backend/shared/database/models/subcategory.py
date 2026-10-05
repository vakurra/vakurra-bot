from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.shared.database.base import Base


class Subcategory(Base):
    __tablename__ = "subcategories"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="CASCADE"),
        nullable=False,
    )

    category: Mapped["Category"] = relationship(
        "Category",
    )

    bots: Mapped[list["TelegramBot"]] = relationship(
        secondary="telegram_bot_categories",
        back_populates="subcategories",
    )
    