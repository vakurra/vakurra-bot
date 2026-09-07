import type {
  TelegramThemeParams,
  TelegramWebApp,
  ThemeScheme,
} from "./types";

function getSystemScheme(): ThemeScheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(
  scheme: ThemeScheme,
  telegramParams: TelegramThemeParams = {},
) {
  const root = document.documentElement;
  root.dataset.theme = scheme;
  root.style.colorScheme = scheme;

  const telegramVariables: Record<string, string> = {
    "--app-bg": "bg_color",
    "--app-surface": "section_bg_color",
    "--app-surface-muted": "secondary_bg_color",
    "--app-text": "text_color",
    "--app-text-muted": "hint_color",
    "--app-accent": "button_color",
    "--app-accent-text": "button_text_color",
    "--app-danger": "destructive_text_color",
  };

  for (const [variable, telegramName] of Object.entries(telegramVariables)) {
    const value = telegramParams[telegramName];
    if (value) {
      root.style.setProperty(variable, value);
    }
  }
}

export function initializeTelegramTheme() {
  const telegram = window.Telegram?.WebApp;

  if (!telegram) {
    applyTheme(getSystemScheme());
    return;
  }

  telegram.ready();
  telegram.expand();

  const updateTheme = () => {
    applyTheme(
      telegram.colorScheme ?? getSystemScheme(),
      telegram.themeParams,
    );
  };

  updateTheme();
  telegram.onEvent?.("themeChanged", updateTheme);
}
