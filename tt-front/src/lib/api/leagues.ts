import { http } from "./http";
import {
  CreateLeagueDTO,
  LeagueDTO,
  LeagueMatchDTO,
  LeagueMemberDTO,
  LeagueTournamentDTO,
  LeagueStatus,
  CreateChallengeDTO,
  LeagueChallengeDTO,
  ChallengeStatus,
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
 * Lists all Leagues where current user is a member (paginated).
 */
export async function listJoinedLeagues(
  page = 0,
  size = 10,
): Promise<{ content: LeagueDTO[]; totalElements: number }> {
  return http<{ content: LeagueDTO[]; totalElements: number }>(
    `/api/leagues/joined?page=${page}&size=${size}`,
  );
}

/**
 * Lists all Leagues where current user is NOT a member (paginated).
 */
export async function listAvailableLeagues(
  page = 0,
  size = 10,
): Promise<{ content: LeagueDTO[]; totalElements: number }> {
  return http<{ content: LeagueDTO[]; totalElements: number }>(
    `/api/leagues/available?page=${page}&size=${size}`,
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
 * Get Pending Members (Owner Only).
 */
export async function getPendingMembers(
  id: number,
): Promise<LeagueMemberDTO[]> {
  return http<LeagueMemberDTO[]>(`/api/leagues/${id}/members/pending`);
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

/**
 * Updates a League.
 */
export async function updateLeague(
  id: number,
  data: CreateLeagueDTO,
): Promise<LeagueDTO> {
  return http<LeagueDTO>(`/api/leagues/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Deletes a League.
 */
export async function deleteLeague(id: number): Promise<void> {
  return http<void>(`/api/leagues/${id}`, {
    method: "DELETE",
  });
}

/**
 * Sets the status of a League.
 */
export async function setLeagueStatus(
  id: number,
  status: LeagueStatus,
): Promise<void> {
  return http<void>(`/api/leagues/${id}/status?status=${status}`, {
    method: "PUT",
  });
}

/**
 * Leaves a League (for members).
 */
export async function leaveLeague(id: number): Promise<void> {
  return http<void>(`/api/leagues/${id}/leave`, {
    method: "POST",
  });
}

/**
 * Creates a challenge in a League.
 */
export async function createChallenge(
  data: CreateChallengeDTO,
): Promise<LeagueChallengeDTO> {
  return http<LeagueChallengeDTO>(`/api/leagues/${data.leagueId}/challenges`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Responds to a challenge.
 * accepted: true to accept, false to reject.
 */
export async function respondToChallenge(
  challengeId: number,
  accepted: boolean,
): Promise<void> {
  return http<void>(
    `/api/leagues/challenges/${challengeId}/respond?accepted=${accepted}`,
    {
      method: "POST",
    },
  );
}

/**
 * Gets challenges for the current user in a league.
 */
export async function getMyChallenges(
  leagueId: number,
): Promise<LeagueChallengeDTO[]> {
  return http<LeagueChallengeDTO[]>(`/api/leagues/${leagueId}/challenges/my`);
}

/**
 * Gets outgoing challenges (sent by current user) in a league.
 */
export async function getMyOutgoingChallenges(
  leagueId: number,
): Promise<LeagueChallengeDTO[]> {
  return http<LeagueChallengeDTO[]>(`/api/leagues/${leagueId}/challenges/outgoing`);
}
