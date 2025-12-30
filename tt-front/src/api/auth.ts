import type { RegisterDTO } from "../types/auth";

const AUTH_BASE_URL = "http://localhost:8081/api/users/auth";

export async function register(dto: RegisterDTO): Promise<string> {
  const res = await fetch(`${AUTH_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return text;
}
