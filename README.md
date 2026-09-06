# Vakurra TG Bot

Telegram-бот для поиска других ботов. Позволяет смотреть каталог ботов по категориям. Добавлять своих ботов в каталог.

Обычный бот отвечает за регистрацию пользователей и административные функции.
Каталог открывается в Telegram Mini App.

## Структура

vakurra_bot/
│
├── backend/
│   ├── api/                  ← HTTP API
│   ├── bot/                  ← Telegram bot
│   └── shared/               ← общая инфраструктура
│       ├── config.py
│       └── database/
│           └── models/       ← ВСЕ DB models здесь
│
├── frontend/                 ← Telegram Mini App
│   └── src/
│       ├── app/
│       ├── pages/
│       ├── shared/
│       │   ├── api/
│       │   └── telegram/
│       └── styles/
│
├── infra/
│   ├── docker/
│   ├── migrations/
│   └── docker-compose.*
│
└── README.md


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
