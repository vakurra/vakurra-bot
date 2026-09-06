import { getTelegramInitData } from "../telegram/auth";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";

type RequestOptions = {
  authenticated?: boolean;
};

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: HeadersInit = {};

  if (options.authenticated) {
    const initData = getTelegramInitData();

    headers.Authorization = `TMA ${initData}`;
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  health: () =>
    request<{ status: string }>("/api/v1/health"),

  me: () =>
    request<{
      id: number;
      username: string | null;
      first_name: string | null;
    }>("/api/v1/me", {
      authenticated: true,
    }),
};