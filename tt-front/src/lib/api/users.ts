"use client";

import { http } from "./http";
import type { UserLookupDTO } from "../types/systems";
import type { UserProfile, UpdateProfileDTO } from "../types/auth";

const USER_SERVICE_URL =
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ?? "http://localhost:8081";

export function searchUsers(query: string, token: string, limit: number = 10) {
  return http<UserLookupDTO[]>(
    `/api/users/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function getProfile(token: string) {
  const res = await fetch(`${USER_SERVICE_URL}/api/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} : ${text || res.statusText}`);
  }

  return (await res.json()) as UserProfile;
}

export async function updateProfile(data: UpdateProfileDTO, token: string) {
  const res = await fetch(`${USER_SERVICE_URL}/api/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} : ${text || res.statusText}`);
  }

  return (await res.json()) as UserProfile;
}
