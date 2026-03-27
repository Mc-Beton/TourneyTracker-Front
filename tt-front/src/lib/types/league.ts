import { MatchMode } from "./singleMatch";

export type MatchStatus =
  | "PENDING"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";
export type TournamentStatus =
  | "PENDING"
  | "DRAFT"
  | "ACTIVE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";
export type LeagueMemberStatus = "PENDING" | "APPROVED" | "REJECTED";
// LeagueApprovalStatus removed
export type LeagueStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
export type ChallengeStatus = MatchStatus;

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
  winnerId?: number;
  player1Score?: number;
  player2Score?: number;
  mode: MatchMode;
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
  paymentRequired: boolean;

  status: LeagueStatus;

  // Scoring config
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  pointsParticipation: number;
  pointsPerParticipant: number;
  pointsFirstPlace: number;
  pointsSecondPlace: number;
  pointsThirdPlace: number;

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
  matchMode: MatchMode;
}

export interface CreateChallengeDTO {
  leagueId: number;
  opponentId: number;
  scheduledTime: string;
  message?: string;
  matchMode?: MatchMode;
}

export interface CreateLeagueDTO {
  name: string;
  description: string;
  gameSystemId: number;
  startDate: string;
  endDate: string;
  autoAcceptGames: boolean;
  autoAcceptTournaments: boolean;
  paymentRequired: boolean;
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  pointsParticipation: number;
  pointsPerParticipant: number;
  pointsFirstPlace: number;
  pointsSecondPlace: number;
  pointsThirdPlace: number;
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
  hasPaid: boolean;
}

export interface LeagueMatchDTO {
  id: number;
  leagueId: number;
  match: SingleMatchResponseDTO;
  submittedBy: UserDTO;
  status: MatchStatus;
  submitDate: string;
  processedDate?: string;
  rejectionReason?: string;
}

export interface LeagueTournamentDTO {
  id: number;
  leagueId: number;
  tournament: TournamentResponseDTO;
  submittedBy: UserDTO;
  status: TournamentStatus;
  submitDate: string;
  processedDate?: string;
  rejectionReason?: string;
}
