import { http } from "./http";
import type { TournamentChallengeDTO } from "@/lib/types/tournament";

export interface TournamentChallengeDTO {
  id: number;
  tournamentId: number;
  challengerId: number;
  challengerName: string;
  opponentId: number;
  opponentName: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

export function getChallenges(tournamentId: number, token: string) {
  return http<TournamentChallengeDTO[]>(
    `/api/tournaments/${tournamentId}/challenges`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}

export function createChallenge(
  tournamentId: number,
  opponentId: number,
  token: string,
) {
  return http<TournamentChallengeDTO>(
    `/api/tournaments/${tournamentId}/challenges?opponentId=${opponentId}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}

export function acceptChallenge(
  tournamentId: number,
  challengeId: number,
  token: string,
) {
  return http<void>(
    `/api/tournaments/${tournamentId}/challenges/${challengeId}/accept`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}

export function rejectChallenge(
  tournamentId: number,
  challengeId: number,
  token: string,
) {
  return http<void>(
    `/api/tournaments/${tournamentId}/challenges/${challengeId}/reject`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}

export function cancelChallenge(
  tournamentId: number,
  challengeId: number,
  token: string,
) {
  return http<void>(
    `/api/tournaments/${tournamentId}/challenges/${challengeId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}
