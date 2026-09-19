import type { ThemeScheme } from "./types";

function getSystemScheme(): ThemeScheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(scheme: ThemeScheme) {
  const root = document.documentElement;

  root.dataset.theme = scheme;
  root.style.colorScheme = scheme;
}

export function initializeTelegramTheme() {
  const telegram = window.Telegram?.WebApp;

  if (!telegram) {
    applyTheme(getSystemScheme());
    return;
  }

  telegram.ready();
  telegram.expand();
  telegram.disableVerticalSwipes();

  const updateTheme = () => {
    applyTheme(telegram.colorScheme ?? getSystemScheme());
  };

  updateTheme();

  telegram.onEvent?.("themeChanged", updateTheme);
}
