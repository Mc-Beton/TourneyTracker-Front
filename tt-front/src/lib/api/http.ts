"use client";

import { readToken } from "../auth/authStorage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const token = readToken();
  
  const finalHeaders: Record<string, string> = {
    ...(init?.headers ?? {}),
    "Content-Type": "application/json",
  };

  // Dodaj token JWT jeśli istnieje
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  console.log("HTTP Request:", {
    url: `${API_BASE_URL}${path}`,
    method: init?.method || "GET",
    headers: finalHeaders,
    hasToken: !!token,
  });

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: finalHeaders,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} : ${text || res.statusText}`);
  }

  // Check if response has content before parsing JSON
  const contentType = res.headers.get("content-type");
  const hasContent = res.headers.get("content-length") !== "0";
  
  if (!contentType?.includes("application/json") || !hasContent) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
