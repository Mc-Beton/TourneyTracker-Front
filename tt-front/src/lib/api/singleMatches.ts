"use client";

import { http } from "./http";
import type {
  SingleMatchResponseDTO,
  CreateSingleMatchDTO,
  MatchStatusDTO,
  MatchSummaryDTO,
} from "../types/singleMatch";

export function getMySingleMatches(token: string) {
  return http<SingleMatchResponseDTO[]>("/api/matches/single/mine", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function createSingleMatch(
  payload: CreateSingleMatchDTO,
  token: string,
): Promise<SingleMatchResponseDTO> {
  return http<SingleMatchResponseDTO>("/api/matches/single", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function reportReady(
  matchId: number,
  token: string,
): Promise<MatchStatusDTO> {
  return http<MatchStatusDTO>(`/api/player/matches/${matchId}/report-ready`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getMatchSummary(
  matchId: number,
  token: string,
): Promise<MatchSummaryDTO> {
  return http<MatchSummaryDTO>(`/api/matches/${matchId}/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function startMatch(
  matchId: number,
  token: string,
): Promise<MatchStatusDTO> {
  return http<MatchStatusDTO>(`/api/player/matches/${matchId}/start`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
