from backend.bot.commands import bot_commands


BOT_COMMANDS = {
    f"/{command.command}"
    for command in bot_commands
}


MAIN_MENU_ACTIONS = {
    "Вход в приложение",
    "Пользователи",
    "Реклама",
}


GLOBAL_ACTIONS = BOT_COMMANDS | MAIN_MENU_ACTIONS
