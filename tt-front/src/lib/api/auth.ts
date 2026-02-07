"use client";

import type { RegisterDTO, LoginDTO } from "../types/auth";

const AUTH_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/auth`
  : "http://localhost:8080/auth";

function parseErrorMessage(text: string): string {
  try {
    const obj = JSON.parse(text);

    const msg =
      obj?.message || obj?.error || "Wystąpił błąd podczas rejestracji.";

    if (msg.includes("Email already in use")) {
      return "Taki e-mail jest już zajęty.";
    }

    return msg;
  } catch {
    if (text.includes("Email already in use")) {
      return "Taki e-mail jest już zajęty.";
    }

    return text || "Wystąpił błąd podczas rejestracji.";
  }
}

export async function login(dto: LoginDTO): Promise<string> {
  const res = await fetch(`${AUTH_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

  return text;
}

export async function register(dto: RegisterDTO): Promise<string> {
  const res = await fetch(`${AUTH_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(parseErrorMessage(text));
  }

  return text || "Rejestracja zakończona sukcesem!";
}
