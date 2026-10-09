import { getTelegramInitData } from "../telegram/auth";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";
const apiPath = "/api/v1";

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
    body:
      options.body !== undefined
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

export type CatalogBot = {
  username: string;
  name: string;
  about: string | null;
  description: string | null;
  mau: number | null;
  verified: boolean;
  has_main_app: boolean;
  menu_web_app_url: string | null;
  profile_photo_url: string | null;
  subcategories: Subcategory[];
};

export type CatalogBotsResponse = {
  items: CatalogBot[];
  has_more: boolean;
};

export type MyBot = {
  id: number;
  username: string;
  name: string;
  profile_photo_url: string | null;
  status: string;
  rejection_reason: string | null;
};

export type MyBotsResponse = {
  items: MyBot[];
  has_more: boolean;
};

export type AdminBot = {
  id: number;
  username: string;
  name: string;
  profile_photo_url: string | null;
  submitted_by: number;
  submitted_by_username: string | null;
  submitted_by_first_name: string | null;
  status: string;
  subcategories: Subcategory[];
};

export type AdminBotsResponse = {
  items: AdminBot[];
  has_more: boolean;
};

export type Subcategory = {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
};

export type Category = {
  id: number;
  name: string;
  subcategories: Subcategory[];
};

type CatalogBotsParams = {
  search?: string;
  subcategoryIds?: number[];
  limit?: number;
  offset?: number;
};

export const api = {
  health: () => request<{ status: string }>(`${apiPath}/health`),

  me: () =>
    request<{
      id: number;
      username: string | null;
      first_name: string | null;
      role: "default" | "admin";
    }>(`${apiPath}/me`, { authenticated: true }),

  previewBot: (username: string) =>
    request<BotPreview>(`${apiPath}/bots/preview`, {
      method: "POST",
      authenticated: true,
      body: {
        username,
      },
    }),

  catalogBots: (params: CatalogBotsParams = {}) => {
    const query = new URLSearchParams();

    if (params.search?.trim()) {
      query.set("search", params.search.trim());
    }

    for (const subcategoryId of params.subcategoryIds ?? []) {
      query.append("subcategory_ids", String(subcategoryId));
    }

    if (params.limit !== undefined) {
      query.set("limit", String(params.limit));
    }

    if (params.offset !== undefined) {
      query.set("offset", String(params.offset));
    }

    const queryString = query.toString();

    return request<CatalogBotsResponse>(
      `${apiPath}/bots${queryString ? `?${queryString}` : ""}`,
    );
  },

  submitBot: (username: string, subcategoryIds: number[]) =>
    request<{ id: number; status: string }>(`${apiPath}/bots/submit`, {
      method: "POST",
      authenticated: true,
      body: {
        username,
        subcategory_ids: subcategoryIds,
      },
    }),

  myBots: (params: { limit?: number; offset?: number } = {}) => {
    const query = new URLSearchParams();

    if (params.limit !== undefined) {
      query.set("limit", String(params.limit));
    }

    if (params.offset !== undefined) {
      query.set("offset", String(params.offset));
    }

    const queryString = query.toString();

    return request<MyBotsResponse>(
      `${apiPath}/me/bots${queryString ? `?${queryString}` : ""}`,
      { authenticated: true },
    );
  },

  adminBots: (params: { limit?: number; offset?: number } = {}) => {
    const query = new URLSearchParams();

    if (params.limit !== undefined) {
      query.set("limit", String(params.limit));
    }

    if (params.offset !== undefined) {
      query.set("offset", String(params.offset));
    }

    const queryString = query.toString();

    return request<AdminBotsResponse>(
      `${apiPath}/admin/bots${queryString ? `?${queryString}` : ""}`,
      { authenticated: true },
    );
  },

  approveBot: (botId: number) =>
    request<{ id: number; status: string }>(
      `${apiPath}/admin/bots/${botId}/approve`,
      {
        method: "POST",
        authenticated: true,
      },
    ),

  rejectBot: (botId: number, reason: string) =>
    request<{ id: number; status: string }>(
      `${apiPath}/admin/bots/${botId}/reject`,
      {
        method: "POST",
        authenticated: true,
        body: {
          reason,
        },
      },
    ),

  categories: () =>
    request<Category[]>(`${apiPath}/categories`),
};
