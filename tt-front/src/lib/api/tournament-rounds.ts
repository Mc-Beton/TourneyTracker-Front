import { http } from "./http";
import type {
  TournamentRoundViewDTO,
  RoundStatusDTO,
  ParticipantStatsDTO,
  PodiumDTO,
} from "@/lib/types/tournament";

export async function startRound(
  tournamentId: number,
  roundNumber: number,
  token: string,
): Promise<void> {
  await http<void>(
    `/api/tournaments/${tournamentId}/rounds/${roundNumber}/start`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}

export async function extendSubmissionDeadline(
  tournamentId: number,
  roundNumber: number,
  additionalMinutes: number,
  token: string,
): Promise<void> {
  await http<void>(
    `/api/tournaments/${tournamentId}/rounds/${roundNumber}/extend?additionalMinutes=${additionalMinutes}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}

export async function getRoundStatusForOrganizer(
  tournamentId: number,
  roundNumber: number,
  token: string,
): Promise<RoundStatusDTO> {
  return await http<RoundStatusDTO>(
    `/api/tournaments/${tournamentId}/rounds/${roundNumber}/organizer-status`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}

export async function getTournamentRoundsView(
  tournamentId: number,
  token?: string,
): Promise<TournamentRoundViewDTO[]> {
  return await http<TournamentRoundViewDTO[]>(
    `/api/tournaments/${tournamentId}/rounds/all`,
    token ? { headers: { Authorization: `Bearer ${token}` } } : {},
  );
}

export async function createFirstRoundPairings(
  tournamentId: number,
  token: string,
): Promise<void> {
  await http<void>(`/api/tournaments/${tournamentId}/rounds/start-first`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createNextRoundPairings(
  tournamentId: number,
  token: string,
): Promise<void> {
  await http<void>(`/api/tournaments/${tournamentId}/rounds/start-next`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getParticipantStats(
  tournamentId: number,
  token?: string,
): Promise<ParticipantStatsDTO[]> {
  return await http<ParticipantStatsDTO[]>(
    `/api/tournaments/${tournamentId}/participants/stats`,
    token ? { headers: { Authorization: `Bearer ${token}` } } : {},
  );
}

export async function getPodium(
  tournamentId: number,
  token?: string,
): Promise<PodiumDTO> {
  return await http<PodiumDTO>(
    `/api/tournaments/${tournamentId}/podium`,
    token ? { headers: { Authorization: `Bearer ${token}` } } : {},
  );
}

export async function completeTournament(
  tournamentId: number,
  token: string,
): Promise<void> {
  await http<void>(`/api/tournaments/${tournamentId}/complete`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function startIndividualMatch(
  tournamentId: number,
  roundNumber: number,
  matchId: number,
  token: string,
): Promise<void> {
  await http<void>(
    `/api/tournaments/${tournamentId}/rounds/${roundNumber}/matches/${matchId}/start`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}
