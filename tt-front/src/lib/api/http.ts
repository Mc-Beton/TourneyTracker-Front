"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const finalHeaders = {
    ...(init?.headers ?? {}),
    "Content-Type": "application/json",
  };

  console.log("HTTP Request:", {
    url: `${API_BASE_URL}${path}`,
    method: init?.method || "GET",
    headers: finalHeaders,
  });

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: finalHeaders,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} : ${text || res.statusText}`);
  }

  return (await res.json()) as T;
}
