from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.shared.database.models.category import Category
from backend.shared.database.models.subcategory import Subcategory


class CategoryService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_all_with_subcategories(
        self,
    ) -> list[tuple[Category, list[Subcategory]]]:
        categories_result = await self.session.execute(
            select(Category).order_by(Category.id)
        )
        categories = list(categories_result.scalars().all())

        subcategories_result = await self.session.execute(
            select(Subcategory).order_by(
                Subcategory.category_id,
                Subcategory.id,
            )
        )
        subcategories = list(subcategories_result.scalars().all())

        subcategories_by_category: dict[int, list[Subcategory]] = {}

        for subcategory in subcategories:
            subcategories_by_category.setdefault(
                subcategory.category_id,
                [],
            ).append(subcategory)

        return [
            (
                category,
                subcategories_by_category.get(category.id, []),
            )
            for category in categories
        ]
        