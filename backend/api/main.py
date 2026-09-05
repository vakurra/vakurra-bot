from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.core.config import settings
from backend.api.routes.health import router as health_router


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
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_url],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.include_router(health_router, prefix=settings.api_prefix)

    return application


app = create_app()
