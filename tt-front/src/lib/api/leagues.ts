import { http } from "./http";
import {
  CreateLeagueDTO,
  LeagueDTO,
  LeagueMatchDTO,
  LeagueMemberDTO,
  LeagueTournamentDTO,
} from "../types/league";

/**
 * Creates a new League.
 */
export async function createLeague(data: CreateLeagueDTO): Promise<LeagueDTO> {
  return http<LeagueDTO>("/api/leagues", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Lists all Leagues (paginated).
 */
export async function listLeagues(
  page = 0,
  size = 10,
): Promise<{ content: LeagueDTO[]; totalElements: number }> {
  // Backend returns Page<LeagueDTO>.
  return http<{ content: LeagueDTO[]; totalElements: number }>(
    `/api/leagues?page=${page}&size=${size}`,
  );
}

/**
 * Get League details by ID.
 */
export async function getLeague(id: number): Promise<LeagueDTO> {
  return http<LeagueDTO>(`/api/leagues/${id}`);
}

/**
 * Get League Members (Leaderboard).
 */
export async function getLeagueMembers(id: number): Promise<LeagueMemberDTO[]> {
  return http<LeagueMemberDTO[]>(`/api/leagues/${id}/members`);
}

/**
 * Get League Matches (History).
 */
export async function getLeagueMatches(
  id: number,
  page = 0,
  size = 10,
): Promise<{ content: LeagueMatchDTO[]; totalElements: number }> {
  return http<{ content: LeagueMatchDTO[]; totalElements: number }>(
    `/api/leagues/${id}/matches?page=${page}&size=${size}`,
  );
}

/**
 * Get League Tournaments (History).
 */
export async function getLeagueTournaments(
  id: number,
  page = 0,
  size = 10,
): Promise<{ content: LeagueTournamentDTO[]; totalElements: number }> {
  return http<{ content: LeagueTournamentDTO[]; totalElements: number }>(
    `/api/leagues/${id}/tournaments?page=${page}&size=${size}`,
  );
}

/**
 * Join a League.
 */
export async function joinLeague(id: number): Promise<void> {
  return http<void>(`/api/leagues/${id}/join`, {
    method: "POST",
  });
}

/**
 * Submit a Match to a League.
 */
export async function submitMatch(
  leagueId: number,
  matchId: number,
): Promise<void> {
  return http<void>(
    `/api/leagues/${leagueId}/matches/submit?matchId=${matchId}`,
    {
      method: "POST",
    },
  );
}

/**
 * Submit a Tournament to a League.
 */
export async function submitTournament(
  leagueId: number,
  tournamentId: number,
): Promise<void> {
  return http<void>(
    `/api/leagues/${leagueId}/tournaments/submit?tournamentId=${tournamentId}`,
    {
      method: "POST",
    },
  );
}

/**
 * Approve a member request (Owner Only).
 */
export async function approveMember(
  leagueId: number,
  userId: number,
): Promise<void> {
  return http<void>(`/api/leagues/${leagueId}/members/${userId}/approve`, {
    method: "POST",
  });
}
