import { getTelegramInitData } from "../telegram/auth";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";

type RequestOptions = {
  method?: "GET" | "POST";
  authenticated?: boolean;
  body?: unknown;
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

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined
      ? JSON.stringify(options.body)
      : undefined,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export type BotPreview = {
  id: number;
  username: string;
  name: string;
  about: string | null;
  description: string | null;
  mau: number | null;
  verified: boolean;
  restricted: boolean;
  scam: boolean;
  fake: boolean;
  has_main_app: boolean;
  menu_web_app_url: string | null;
  profile_photo_url: string | null;
};

export type MyBot = {
  id: number;
  username: string;
  name: string;
  profile_photo_url: string | null;
  status: string;
};

export const api = {
  health: () => request<{ status: string }>("/api/v1/health"),

  me: () =>
    request<{
      id: number;
      username: string | null;
      first_name: string | null;
    }>("/api/v1/me", { authenticated: true }),

  previewBot: (username: string) =>
    request<BotPreview>("/api/v1/bots/preview", {
      method: "POST",
      authenticated: true,
      body: {
        username,
      },
    }),
  
  submitBot: (username: string) =>
    request<{
      id: number;
      status: string;
    }>("/api/v1/bots/submit", {
      method: "POST",
      authenticated: true,
      body: {
        username,
      },
    }),

  myBots: () =>
    request<MyBot[]>("/api/v1/me/bots", {
      authenticated: true,
    }),
};
