"use client";

import { http } from "./http";
import type { MatchScoringDTO, SubmitScoreDTO } from "../types/scoring";

export function getMatchScoring(matchId: number, token: string) {
  return http<MatchScoringDTO>(`/api/matches/${matchId}/scoring`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function submitRoundScores(
  matchId: number,
  payload: SubmitScoreDTO,
  token: string,
): Promise<MatchScoringDTO> {
  return http<MatchScoringDTO>(`/api/matches/${matchId}/scores`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function startRound(
  matchId: number,
  token: string,
): Promise<MatchScoringDTO> {
  return http<MatchScoringDTO>(`/api/matches/${matchId}/rounds/start`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function endRound(
  matchId: number,
  roundNumber: number,
  token: string,
): Promise<MatchScoringDTO> {
  return http<MatchScoringDTO>(
    `/api/matches/${matchId}/rounds/${roundNumber}/end`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function finishMatch(
  matchId: number,
  token: string,
): Promise<MatchScoringDTO> {
  return http<MatchScoringDTO>(`/api/matches/${matchId}/finish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
