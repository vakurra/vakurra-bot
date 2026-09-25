import asyncio

from backend.telegram.parser import TelegramParser


async def main() -> None:
    parser = TelegramParser()

    try:
        await parser.start()
        print("Telegram parser authorized successfully.")
    finally:
        await parser.stop()


if __name__ == "__main__":
    asyncio.run(main())
    