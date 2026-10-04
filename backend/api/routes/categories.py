from fastapi import APIRouter

from backend.shared.database.session import SessionLocal
from backend.shared.services.category import CategoryService


router = APIRouter(
    prefix="/categories",
    tags=["categories"],
)


@router.get("")
async def get_categories() -> list[dict]:
    async with SessionLocal() as session:
        category_service = CategoryService(session)
        categories = await category_service.get_all_with_subcategories()

    return [
        {
            "id": category.id,
            "name": category.name,
            "subcategories": [
                {
                    "id": subcategory.id,
                    "name": subcategory.name,
                }
                for subcategory in subcategories
            ],
        }
        for category, subcategories in categories
    ]
    