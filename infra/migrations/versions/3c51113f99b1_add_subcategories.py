"""add subcategories

Revision ID: 3c51113f99b1
Revises: 3801d4f98fa3
Create Date: 2026-10-02 10:56:27.313612

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3c51113f99b1"
down_revision: Union[str, Sequence[str], None] = "3801d4f98fa3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "subcategories",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=64), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["category_id"],
            ["categories.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.drop_table("telegram_bot_categories")

    op.create_table(
        "telegram_bot_categories",
        sa.Column("bot_id", sa.BigInteger(), nullable=False),
        sa.Column("subcategory_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["bot_id"],
            ["telegram_bots.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["subcategory_id"],
            ["subcategories.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("bot_id", "subcategory_id"),
    )

    op.drop_constraint(
        op.f("categories_slug_key"),
        "categories",
        type_="unique",
    )
    op.drop_column("categories", "slug")


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("telegram_bot_categories")

    op.create_table(
        "telegram_bot_categories",
        sa.Column("bot_id", sa.BigInteger(), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["bot_id"],
            ["telegram_bots.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["category_id"],
            ["categories.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("bot_id", "category_id"),
    )

    op.drop_table("subcategories")

    op.add_column(
        "categories",
        sa.Column(
            "slug",
            sa.String(length=64),
            nullable=True,
        ),
    )

    op.create_unique_constraint(
        op.f("categories_slug_key"),
        "categories",
        ["slug"],
        postgresql_nulls_not_distinct=False,
    )
    