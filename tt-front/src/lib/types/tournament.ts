export type Tournament = {
  id: string;
  name: string;
  location?: string;
  startDate?: string;
  gameSystem?: string;
};

export type TournamentStatus = "DRAFT" | "ACTIVE" | "FINISHED" | "CANCELLED";

export type TournamentParticipantDTO = {
  userId: number;
  name: string;
  email: string;
  confirmed: boolean;
};

export type TournamentListItemDTO = {
  id: number;
  name: string;
  startDate: string;
  numberOfRounds: number;
  roundDurationMinutes: number;
  gameSystemId: number;
  organizerId: number;
  location?: string;
  type?: string;
  currentParticipants?: number;
  maxParticipants?: number;
  status?: TournamentStatus;
};

export type TournamentDetailsDTO = TournamentListItemDTO & {
  participantIds: number[];
};

export type ScoringSystem = "ROUND_BY_ROUND" | "END_OF_MATCH";
export type TournamentType = "SWISS";

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
  gameSystemId: number;
  type?: TournamentType;
  maxParticipants?: number;
  registrationDeadline?: string;
  location?: string;
  venue?: string;
  scoringSystem?: ScoringSystem;
  enabledScoreTypes?: string[];
  requireAllScoreTypes: boolean;
  minScore?: number;
  maxScore?: number;
};
