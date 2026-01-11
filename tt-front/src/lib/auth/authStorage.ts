"use client";

export const TOKEN_KEY = "tt_token";
export const USERNAME_KEY = "tt_username";
export const USER_ID_KEY = "tt_userId";

export function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function readUsername(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USERNAME_KEY);
}

export function readUserId(): number | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(USER_ID_KEY);
  return id ? parseInt(id) : null;
}

export function writeAuth(
  token: string,
  username?: string | null,
  userId?: number | null
) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  if (username) localStorage.setItem(USERNAME_KEY, username);
  else localStorage.removeItem(USERNAME_KEY);
  if (userId) localStorage.setItem(USER_ID_KEY, userId.toString());
  else localStorage.removeItem(USER_ID_KEY);
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(USER_ID_KEY);
}
