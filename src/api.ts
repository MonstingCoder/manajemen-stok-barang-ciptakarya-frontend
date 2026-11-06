import type {
  InventoryItem,
  InventoryTag,
  InventoryUser,
  ItemInput,
  UserInput,
} from "./types";

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(
  /\/$/,
  "",
);
const PAGE_SIZE = 50;

export class ApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const token = localStorage.getItem("ciptakarya-token");
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  if (authenticated && token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(
      "Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.",
      0,
    );
  }

  if (response.status === 401 && authenticated) {
    localStorage.removeItem("ciptakarya-token");
    window.dispatchEvent(new Event("auth:expired"));
  }

  const text = await response.text();
  const body: unknown = text ? safeJson(text) : null;
  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? String(body.message)
        : `Permintaan gagal (${response.status})`;
    throw new ApiError(message, response.status);
  }
  return body as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError("Server mengembalikan respons yang tidak valid.", 0);
  }
}

function readField(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    const found = Object.keys(record).find(
      (candidate) => candidate.toLowerCase() === key.toLowerCase(),
    );
    if (found) return record[found];
  }
  return undefined;
}

function requiredString(
  record: Record<string, unknown>,
  label: string,
): string {
  const value = readField(record, label);
  if (typeof value !== "string") {
    throw new ApiError(`Field ${label} pada respons server tidak valid.`, 0);
  }
  return value;
}

function requiredNumber(
  record: Record<string, unknown>,
  label: string,
): number {
  const value = readField(record, label);
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ApiError(`Field ${label} pada respons server tidak valid.`, 0);
  }
  return value;
}

function optionalString(value: unknown, label: string): string {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") {
    throw new ApiError(`Field ${label} pada respons server tidak valid.`, 0);
  }
  return value;
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(`Data ${label} dari server tidak valid.`, 0);
  }
  return value as Record<string, unknown>;
}

function toItem(value: unknown): InventoryItem {
  const record = asRecord(value, "barang");
  const rawTags = readField(record, "tags");
  if (rawTags !== undefined && rawTags !== null && !Array.isArray(rawTags)) {
    throw new ApiError("Daftar tag barang dari server tidak valid.", 0);
  }
  return {
    ID: requiredNumber(record, "id"),
    Name: requiredString(record, "name"),
    Price: requiredNumber(record, "price"),
    Quantity: requiredNumber(record, "quantity"),
    Description: optionalString(readField(record, "description"), "description"),
    Tags: ((rawTags as unknown[] | null | undefined) ?? []).map((tag) => {
      const itemTag = asRecord(tag, "tag barang");
      return {
        ID: requiredNumber(itemTag, "id"),
        Name: requiredString(itemTag, "name"),
      };
    }),
  };
}

function toTag(value: unknown): InventoryTag {
  const record = asRecord(value, "tag");
  return {
    ID: requiredNumber(record, "id"),
    Name: requiredString(record, "name"),
  };
}

function toUser(value: unknown): InventoryUser {
  const record = asRecord(value, "pengguna");
  const rawRole = readField(record, "role");
  const role =
    rawRole === null || rawRole === undefined
      ? undefined
      : (() => {
          const roleRecord = asRecord(rawRole, "peran pengguna");
          return {
            ID: requiredNumber(roleRecord, "id"),
            Name: requiredString(roleRecord, "name"),
          };
        })();
  return {
    ID: requiredNumber(record, "id"),
    name: requiredString(record, "name"),
    email: requiredString(record, "email"),
    role_id: requiredNumber(record, "role_id"),
    role,
  };
}

function toArray<T>(body: unknown, mapper: (value: unknown) => T): T[] {
  if (!Array.isArray(body)) {
    throw new ApiError("Server mengembalikan daftar dengan format yang tidak valid.", 0);
  }
  return body.map(mapper);
}

const pageQuery = (offset: number) =>
  `limit=${PAGE_SIZE}&offset=${Math.max(0, offset)}`;

export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string }>(
      "/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false,
    ),
};

export const itemsApi = {
  list: async (offset: number) =>
    toArray(
      await request<unknown>(`/items?${pageQuery(offset)}`),
      toItem,
    ),
  findByName: async (name: string) =>
    toArray(await request<unknown>(`/items/${encodeURIComponent(name)}`), toItem),
  listByTag: async (tagName: string, offset: number) =>
    toArray(
      await request<unknown>(`/tags/${encodeURIComponent(tagName)}/items?${pageQuery(offset)}`),
      toItem,
    ),
  create: (input: ItemInput) =>
    request<unknown>("/items", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (id: number, input: ItemInput) =>
    request<unknown>(`/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  remove: (id: number) =>
    request<unknown>(`/items/${id}`, { method: "DELETE" }),
};

export const tagsApi = {
  list: async (offset = 0) =>
    toArray(await request<unknown>(`/tags?${pageQuery(offset)}`), toTag),
  create: (name: string) =>
    request<unknown>("/tags", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  remove: (id: number) =>
    request<unknown>(`/tags/${id}`, { method: "DELETE" }),
};

export const usersApi = {
  me: async () => toUser(await request<unknown>("/users/me")),
  list: async (offset: number) =>
    toArray(
      await request<unknown>(`/users?${pageQuery(offset)}`),
      toUser,
    ),
  update: (id: number, input: UserInput) =>
    request<unknown>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  remove: (id: number) =>
    request<unknown>(`/users/${id}`, { method: "DELETE" }),
};

export { PAGE_SIZE };
