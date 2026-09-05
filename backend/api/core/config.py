from dataclasses import dataclass
import os

from dotenv import load_dotenv


load_dotenv()


@dataclass(frozen=True)
class Settings:
    """Configuration used by the HTTP API.

    Domain modules should receive dependencies instead of reading environment
    variables directly. This keeps the application easy to test and extend.
    """

    app_name: str = os.getenv("APP_NAME", "Vakurra API")
    environment: str = os.getenv("APP_ENV", "development")
    api_prefix: str = "/api/v1"
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:5173")


settings = Settings()
