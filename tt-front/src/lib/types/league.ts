export type LeagueMemberStatus = "PENDING" | "APPROVED" | "REJECTED";
export type LeagueApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type LeagueStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
export type ChallengeStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";

export interface UserDTO {
  id: number;
  name: string;
}

export interface GameSystemDTO {
  id: number;
  name: string;
}

export interface SingleMatchResponseDTO {
  matchId: number;
  matchName: string | null;
  startTime: string;
  gameSystemName?: string;
  player1Id: number;
  player1Name: string;
  player2Id: number;
  player2Name: string;
}

export interface TournamentResponseDTO {
  id: number;
  name: string;
  startDate: string;
}

export interface LeagueDTO {
  id: number;
  name: string;
  description?: string;
  gameSystem: GameSystemDTO;
  owner: UserDTO;
  startDate: string;
  endDate: string;
  autoAcceptGames: boolean;
  autoAcceptTournaments: boolean;

  status: LeagueStatus;

  // Scoring config
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  pointsParticipation: number;
  pointsPerParticipant: number;

  memberCount?: number;
}

export interface LeagueChallengeDTO {
  id: number;
  leagueId: number;
  challengerId: number;
  challengerName: string;
  challengedId: number;
  challengedName: string;
  status: ChallengeStatus;
  scheduledTime: string; // ISO DateTime
  message?: string;
  createdAt: string;
}

export interface CreateChallengeDTO {
  leagueId: number;
  opponentId: number;
  scheduledTime: string;
  message?: string;
}

export interface CreateLeagueDTO {
  name: string;
  description: string;
  gameSystemId: number;
  startDate: string;
  endDate: string;
  autoAcceptGames: boolean;
  autoAcceptTournaments: boolean;
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  pointsParticipation: number;
  pointsPerParticipant: number;
}

export interface LeagueMemberDTO {
  id: number;
  leagueId: number;
  user: UserDTO;
  status: LeagueMemberStatus;
  points: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses?: number;
}

export type LeagueMatchDTO = SingleMatchResponseDTO;
export type LeagueTournamentDTO = TournamentResponseDTO;
