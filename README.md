# Vakurra TG Bot

Telegram-бот для поиска других ботов. Позволяет смотреть каталог ботов по категориям. Добавлять своих ботов в каталог.

Обычный бот отвечает за регистрацию пользователей и административные функции.
Каталог открывается в Telegram Mini App.

## Структура

- `backend/api/` — HTTP API на FastAPI: точка входа, настройки API и HTTP-маршруты.
- `backend/modules/` — бизнес-модули приложения: каталог, пользователи, объявления.
- `frontend/` — отдельное React/TypeScript-приложение. Оно не импортирует Python-код
  и общается с backend только через HTTP API.
- `backend/shared/`, `infra/migrations/` — общая persistence-часть приложений.
- `backend/bot/` — Telegram-бот: handlers, keyboards, middlewares и bot services.
  Это отдельный канал, но он использует ту же базу и доменные сервисы.

Новые функции следует добавлять вертикальными модулями: например,
`backend/modules/catalog/` с моделями, схемами, репозиториями, сервисами и API-маршрутами
каталога, а не складывать всю логику в один файл.


## Стек

- Python 3.12.3
- aiogram 3.30.0
- FastAPI
- SQLAlchemy
- Alembic
- PostGRE

## Запуск

1. Заполнить `.env`. Для dev `WEB_APP_URL` можно оставить пустым.
2. Для разработки: `docker compose --env-file .env -f infra/docker-compose.dev.yaml up --build`.
   Frontend будет на `http://localhost:5173`, API — на `http://localhost:8001`.
   В другом терминале запусти `cloudflared tunnel --url http://localhost:5173`
   и укажи полученный URL в BotFather как Menu Button URL.
3. Для production: `docker compose --env-file .env -f infra/docker-compose.prod.yaml up --build -d`.
   Frontend доступен локальному reverse proxy на `127.0.0.1:8080`, API — на `127.0.0.1:8000`.

Миграции Alembic применяются контейнером бота перед запуском.

Точки входа приложений:

- `python -m backend.bot.main` — Telegram-бот.
- `uvicorn backend.api.main:app` — HTTP API.
- `npm run dev` из `frontend/` — frontend Mini App.
