from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from backend.shared.config import settings


# Строка подключения к PostGRE через асинхронный драйвер.
DATABASE_URL = (
    f"postgresql+asyncpg://{settings.db_user}:{settings.db_password}"
    f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
)

# Асинхронный движок SQLAlchemy.
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
)

# Фабрика для создания независимых асинхронных сессий.
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)
