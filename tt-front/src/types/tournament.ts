export type Tournament = {
  id: string; // albo number
  name: string;
  location?: string;
  startDate?: string; // ISO string
  gameSystem?: string;
};

export type TournamentListItemDTO = {
  id: number;
  name: string;
  startDate: string; // LocalDate -> string "YYYY-MM-DD"
  numberOfRounds: number;
  roundDurationMinutes: number;
  gameSystemId: number;
  organizerId: number;
};

export type TournamentDetailsDTO = TournamentListItemDTO & {
  participantIds: number[];
};

export type ScoringSystem = "ROUND_BY_ROUND" | "END_OF_MATCH";
export type TournamentType = "SWISS"; // dodasz inne jak masz w backendzie

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
