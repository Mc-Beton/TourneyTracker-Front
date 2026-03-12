"use client";

import { http } from "./http";
import type { UserLookupDTO } from "../types/systems";
import type {
  UserProfile,
  UpdateProfileDTO,
  UserProfileDTO,
} from "../types/auth";

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

export function searchCities(query: string, token: string, limit: number = 10) {
  return http<string[]>(
    `/api/users/cities?q=${encodeURIComponent(query)}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function getProfile(token: string) {
  return http<UserProfile>("/api/users/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateProfile(data: UpdateProfileDTO, token: string) {
  return http<UserProfile>("/api/users/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function getUserPublicProfile(userId: number) {
  return http<UserProfileDTO>(`/api/users/${userId}/profile`);
}
