"use client";

import { http } from "./http";
import type { UserLookupDTO } from "../types/systems";

export function searchUsers(query: string, token: string, limit: number = 10) {
  return http<UserLookupDTO[]>(
    `/api/users/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
