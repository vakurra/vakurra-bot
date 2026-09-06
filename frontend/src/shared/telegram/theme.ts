import type {
  TelegramThemeParams,
  TelegramWebApp,
  ThemeScheme,
} from "./types";

const palettes: Record<ThemeScheme, Record<string, string>> = {
  light: {
    "--app-bg": "#f4f7fb",
    "--app-surface": "#ffffff",
    "--app-surface-muted": "#eef2f7",
    "--app-text": "#18202a",
    "--app-text-muted": "#718096",
    "--app-border": "#dfe6ef",
    "--app-accent": "#2f80ed",
    "--app-accent-text": "#ffffff",
    "--app-danger": "#d64545",
    "--app-shadow": "0 8px 30px #18202a14",
  },
  dark: {
    "--app-bg": "#17212b",
    "--app-surface": "#202b36",
    "--app-surface-muted": "#2b3947",
    "--app-text": "#f5f7fa",
    "--app-text-muted": "#aab7c4",
    "--app-border": "#344454",
    "--app-accent": "#64a8ff",
    "--app-accent-text": "#102030",
    "--app-danger": "#ff7070",
    "--app-shadow": "0 8px 30px #00000040",
  },
};

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
  const palette = palettes[scheme];

  root.dataset.theme = scheme;
  root.style.colorScheme = scheme;

  for (const [name, value] of Object.entries(palette)) {
    root.style.setProperty(name, value);
  }

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
