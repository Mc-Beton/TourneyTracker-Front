"use client";

import { http } from "./http";
import type { MatchScoringDTO } from "../types/scoring";
import type { SubmitScoreDTO } from "../types/scoring";

export type AdminBulkEditScoresDTO = {
  rounds: SubmitScoreDTO[];
};

export async function getOrganizerMatchScoring(
  matchId: number,
  token: string,
): Promise<MatchScoringDTO> {
  return http<MatchScoringDTO>(`/api/organizer/matches/${matchId}/scoring`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateOrganizerMatchScores(
  matchId: number,
  payload: AdminBulkEditScoresDTO,
  token: string,
): Promise<MatchScoringDTO> {
  return http<MatchScoringDTO>(`/api/organizer/matches/${matchId}/scores`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}
