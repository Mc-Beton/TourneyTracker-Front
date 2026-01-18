"use client";

import { http } from "./http";
import type { IdNameDTO } from "../types/systems";

export function getGameSystems(token: string) {
  return http<IdNameDTO[]>("/api/systems/game-systems", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getDeployments(gameSystemId: number, token: string) {
  return http<IdNameDTO[]>(`/api/systems/${gameSystemId}/deployments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getPrimaryMissions(gameSystemId: number, token: string) {
  return http<IdNameDTO[]>(`/api/systems/${gameSystemId}/primary-missions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
