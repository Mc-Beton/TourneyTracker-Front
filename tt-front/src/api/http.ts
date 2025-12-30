const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `HTTP ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`
    );
  }

  return (await res.json()) as T;
}
