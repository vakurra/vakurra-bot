from dataclasses import dataclass
import os

from dotenv import load_dotenv


load_dotenv()


@dataclass(frozen=True)
class Settings:
    """Application configuration loaded from environment variables."""

    # Application
    app_name: str = os.getenv("APP_NAME", "Vakurra")
    environment: str = os.getenv("APP_ENV", "development")
    api_prefix: str = "/api/v1"

    # Frontend / Mini App
    frontend_url: str = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173",
    )
    web_app_url: str = os.getenv("WEB_APP_URL", "").rstrip("/")

    # Telegram bot
    bot_token: str | None = os.getenv("BOT_TOKEN")
    owner_id: int = int(os.getenv("OWNER_ID", "0"))

    # Database
    db_host: str = os.getenv("DB_HOST", "localhost")
    db_port: int = int(os.getenv("DB_PORT", "5432"))
    db_user: str = os.getenv("DB_USER", "")
    db_password: str = os.getenv("DB_PASSWORD", "")
    db_name: str = os.getenv("DB_NAME", "")


settings = Settings()