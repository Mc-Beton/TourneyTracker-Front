export type Tournament = {
  id: string;
  name: string;
  location?: string;
  startDate?: string;
  gameSystem?: string;
};

export type TournamentStatus =
  | "DRAFT"
  | "ACTIVE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type TournamentPhase =
  | "AWAITING_PAIRINGS"
  | "PAIRINGS_READY"
  | "ROUND_ACTIVE"
  | "ROUND_FINISHED"
  | "TOURNAMENT_COMPLETE";

import { ArmyListStatus } from "./participant";

export type TournamentParticipantDTO = {
  userId: number;
  name: string;
  email: string;
  confirmed: boolean;
  isPaid: boolean;
  armyListStatus: ArmyListStatus;
  armyFactionName: string | null;
  armyName: string | null;
};

export type TournamentListItemDTO = {
  id: number;
  name: string;
  startDate: string;
  numberOfRounds: number;
  roundDurationMinutes: number;
  gameSystemId: number;
  gameSystemName?: string;
  organizerId: number;
  organizerName?: string;
  location?: string;
  description?: string;
  type?: string;
  currentParticipants?: number;
  maxParticipants?: number;
  status?: TournamentStatus;
  phase?: TournamentPhase;
  armyPointsLimit?: number;
  confirmedParticipantsCount?: number;
};

export type TournamentDetailsDTO = TournamentListItemDTO & {
  participantIds: number[];
  roundStartMode?: RoundStartMode;
};

export type ScoringSystem = "ROUND_BY_ROUND" | "END_OF_MATCH";
export type TournamentType = "SWISS";
export type TournamentPointsSystem =
  | "FIXED"
  | "POINT_DIFFERENCE_STRICT"
  | "POINT_DIFFERENCE_LENIENT";
export type RoundStartMode = "ALL_MATCHES_TOGETHER" | "INDIVIDUAL_MATCHES";

export type TournamentListItem = {
  id: number;
  name: string;
  startDate: string;
  numberOfRounds: number;
  roundDurationMinutes: number;
  gameSystemId: number;
  organizerId: number;
};

export type TournamentDetails = TournamentListItem & {
  participantIds: number[];
};

export type CreateTournamentDTO = {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  numberOfRounds: number;
  roundDurationMinutes: number;
  scoreSubmissionExtraMinutes?: number;
  roundStartMode?: RoundStartMode;
  gameSystemId: number;
  type?: TournamentType;
  maxParticipants?: number;
  registrationDeadline?: string;
  location?: string;
  venue?: string;
  armyPointsLimit?: number;
  // Małe punkty (Score Points)
  scoringSystem?: ScoringSystem;
  enabledScoreTypes?: string[];
  requireAllScoreTypes: boolean;
  minScore?: number;
  maxScore?: number;
  // Duże punkty (Tournament Points)
  tournamentPointsSystem?: TournamentPointsSystem;
  pointsForWin?: number;
  pointsForDraw?: number;
  pointsForLoss?: number;
};

export type ParticipantStatsDTO = {
  userId: number;
  userName: string;
  wins: number;
  draws: number;
  losses: number;
  tournamentPoints: number;
  scorePoints: number;
  matchesPlayed: number;
};

export type MatchPairDTO = {
  matchId: number;
  tableNumber: number;
  player1Id: number;
  player1Name: string;
  player1TournamentPoints: number | null;
  player2Id: number | null;
  player2Name: string;
  player2TournamentPoints: number | null;
  status: string;
  startTime: string | null;
  gameEndTime: string | null;
  gameDurationMinutes: number;
  resultSubmissionDeadline: string | null;
  scoresSubmitted: boolean;
  // Wyniki meczów (suma punktów ze wszystkich rund)
  player1TotalScore: number | null;
  player2TotalScore: number | null;
  matchWinner: "PLAYER1" | "PLAYER2" | "DRAW" | null;
};

export type TournamentRoundViewDTO = {
  roundNumber: number;
  status: string;
  matches: MatchPairDTO[];
  canStart: boolean;
};

export type PodiumDTO = {
  first: ParticipantStatsDTO | null;
  second: ParticipantStatsDTO | null;
  third: ParticipantStatsDTO | null;
};

export type RoundStatusDTO = {
  roundNumber: number;
  allScoresSubmitted: boolean;
  playersWithoutScores: string[];
  totalMatches: number;
  completedMatches: number;
};
