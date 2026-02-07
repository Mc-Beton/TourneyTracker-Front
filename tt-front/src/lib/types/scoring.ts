export enum MatchSide {
  PLAYER1 = "PLAYER1",
  PLAYER2 = "PLAYER2",
}

export enum ScoreType {
  MAIN_SCORE = "MAIN_SCORE",
  SECONDARY_SCORE = "SECONDARY_SCORE",
  THIRD_SCORE = "THIRD_SCORE",
  ADDITIONAL_SCORE = "ADDITIONAL_SCORE",
}

export enum RoundStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export type ScoreEntryDTO = {
  side: MatchSide;
  scoreType: ScoreType;
  score: number;
};

export type RoundScoresDTO = {
  roundNumber: number;
  player1MainScore: number | null;
  player1SecondaryScore: number | null;
  player2MainScore: number | null;
  player2SecondaryScore: number | null;
  startTime: string | null;
  endTime: string | null;
  status: RoundStatus;
};

export type MatchScoringDTO = {
  matchId: number;
  matchName: string | null;
  player1Name: string;
  player2Name: string;
  currentRound: number;
  totalRounds: number;
  status: string;
  endTime: string | null;
  gameDurationMinutes: number | null; // czas trwania rundy turniejowej
  resultSubmissionDeadline: string | null; // deadline do wysyłania wyników
  primaryScoreEnabled: boolean;
  secondaryScoreEnabled: boolean;
  thirdScoreEnabled: boolean;
  additionalScoreEnabled: boolean;
  rounds: RoundScoresDTO[];
};

export type SubmitScoreDTO = {
  roundNumber: number;
  scores: ScoreEntryDTO[];
};
