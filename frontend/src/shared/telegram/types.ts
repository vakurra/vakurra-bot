export type ThemeScheme = "light" | "dark";

export type TelegramThemeParams = Record<string, string | undefined>;

export type TelegramWebApp = {
  colorScheme?: ThemeScheme;
  themeParams?: TelegramThemeParams;
  initData?: string;
  ready: () => void;
  expand: () => void;
  onEvent?: (
    event: "themeChanged",
    handler: () => void,
  ) => void;
};

export type TelegramApi = {
  WebApp?: TelegramWebApp;
};

declare global {
  interface Window {
    Telegram?: TelegramApi;
  }
}
