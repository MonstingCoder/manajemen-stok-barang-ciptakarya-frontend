import type { AuthSession, Role } from "./types";

const TOKEN_KEY = "ciptakarya-token";

function decodeSession(token: string): AuthSession | null {
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return null;
    const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payload = JSON.parse(
      atob(paddedBase64),
    ) as Record<string, unknown>;
    if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
      return null;
    }
    const userIdValue = payload.UserID ?? payload.userId ?? payload.user_id;
    if (
      typeof userIdValue !== "number" ||
      !Number.isSafeInteger(userIdValue) ||
      userIdValue <= 0
    ) {
      return null;
    }
    const roleValue = payload.Role ?? payload.role;
    return {
      token,
      userId: userIdValue,
      role: typeof roleValue === "string" && roleValue ? roleValue : null,
    };
  } catch {
    return null;
  }
}

export function getSession(): AuthSession | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const session = decodeSession(token);
  if (!session) localStorage.removeItem(TOKEN_KEY);
  return session;
}

export function storeToken(token: string): AuthSession {
  const session = decodeSession(token);
  if (!session) throw new Error("Token autentikasi dari server tidak valid.");
  localStorage.setItem(TOKEN_KEY, token);
  return session;
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAdminRole(role: Role | null): boolean {
  return role === "admin";
}
