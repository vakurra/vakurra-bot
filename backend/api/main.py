from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.api.routes.health import router as health_router
from backend.api.routes.me import router as me_router
from backend.api.routes.bots import router as bots_router
from backend.shared.config import settings
from backend.telegram.parser import TelegramParser


@asynccontextmanager
async def lifespan(application: FastAPI):
    parser = TelegramParser()

    await parser.start()
    application.state.telegram_parser = parser

    try:
        yield
    finally:
        await parser.stop()


def create_app() -> FastAPI:
    """Build the API application.

    Keeping construction in a function makes tests and future worker
    processes independent from global state.
    """

    application = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        docs_url="/docs" if settings.environment != "production" else None,
        redoc_url="/redoc" if settings.environment != "production" else None,
        lifespan=lifespan,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_url],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.mount(
        "/media",
        StaticFiles(directory="/telegram_media"),
        name="media",
    )
    application.include_router(health_router, prefix=settings.api_prefix)
    application.include_router(me_router, prefix=settings.api_prefix)
    application.include_router(bots_router, prefix=settings.api_prefix)

    return application


app = create_app()
