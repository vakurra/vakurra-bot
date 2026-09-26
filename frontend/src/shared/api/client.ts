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
    let message = `API request failed: ${response.status}`;

    try {
      const data = await response.json();

      if (typeof data.detail === "string") {
        message = data.detail;
      }
    } catch {
      // Ответ не содержит JSON.
    }

    throw new Error(message);
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

export type AdminBot = {
  id: number;
  username: string;
  name: string;
  profile_photo_url: string | null;
  submitted_by: number;
  status: string;
};

export const api = {
  health: () => request<{ status: string }>("/api/v1/health"),

  me: () =>
    request<{
      id: number;
      username: string | null;
      first_name: string | null;
      role: "default" | "admin";
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

  adminBots: () =>
    request<AdminBot[]>("/api/v1/admin/bots", {
      authenticated: true,
    }),
  
  approveBot: (botId: number) =>
    request<{ id: number; status: string }>(
      `/api/v1/admin/bots/${botId}/approve`,
      {
        method: "POST",
        authenticated: true,
      },
    ),

  rejectBot: (botId: number) =>
    request<{ id: number; status: string }>(
      `/api/v1/admin/bots/${botId}/reject`,
      {
        method: "POST",
        authenticated: true,
      },
    ),
};
