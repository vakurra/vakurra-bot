from pathlib import Path

from PIL import Image
from telethon import TelegramClient, functions
from telethon.errors import UsernameNotOccupiedError

from backend.shared.config import settings


class TelegramParser:
    """Получение информации о Telegram-ботах через Telethon."""

    def __init__(self) -> None:
        self.client = TelegramClient(
            "/telegram_session/telegram_parser",
            settings.telegram_api_id,
            settings.telegram_api_hash,
        )

    async def start(self) -> None:
        """Запустить Telegram-клиент."""
        await self.client.start()

    async def stop(self) -> None:
        """Остановить Telegram-клиент."""
        await self.client.disconnect()

    async def download_profile_photo(
        self,
        user,
        bot_id: int,
    ) -> str | None:
        """Скачать и сохранить фотографию профиля бота."""

        media_dir = Path("/telegram_media/bots")
        media_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        source_path = await self.client.download_profile_photo(
            user,
            file=media_dir / f"{bot_id}.jpg",
        )

        if source_path is None:
            return None

        source_path = Path(source_path)
        webp_path = media_dir / f"{bot_id}.webp"

        with Image.open(source_path) as image:
            image = image.convert("RGB")
            image.thumbnail((256, 256))
            image.save(
                webp_path,
                "WEBP",
                quality=85,
            )

        source_path.unlink()

        return str(webp_path)

    async def get_bot(
        self,
        username: str,
    ) -> dict | None:
        """Получить информацию о Telegram-боте."""

        username = username.lstrip("@")

        try:
            resolved = await self.client(
                functions.contacts.ResolveUsernameRequest(
                    username,
                )
            )
        except UsernameNotOccupiedError:
            return None

        user = resolved.users[0]

        if not user.bot:
            return None

        result = await self.client(
            functions.users.GetFullUserRequest(user)
        )

        full_user = result.full_user
        bot_info = full_user.bot_info

        profile_photo = await self.download_profile_photo(
            user,
            user.id,
        )

        return {
            "id": user.id,
            "username": user.username,
            "name": " ".join(
                part
                for part in (
                    user.first_name,
                    user.last_name,
                )
                if part
            ),
            "about": full_user.about,
            "description": (
                bot_info.description
                if bot_info
                else None
            ),
            "mau": user.bot_active_users,
            "verified": user.verified,
            "restricted": user.restricted,
            "scam": user.scam,
            "fake": user.fake,
            "has_main_app": user.bot_has_main_app,
            "menu_web_app_url": (
                bot_info.menu_button.url
                if (
                    bot_info
                    and bot_info.menu_button
                    and hasattr(
                        bot_info.menu_button,
                        "url",
                    )
                )
                else None
            ),
            "profile_photo_url": profile_photo,
        }
        