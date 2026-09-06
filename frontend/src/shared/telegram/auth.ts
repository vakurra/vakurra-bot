export function getTelegramInitData(): string {
  const initData = window.Telegram?.WebApp?.initData;

  if (!initData) {
    throw new Error("Telegram initData недоступен.");
  }

  return initData;
}
