export enum MatchMode {
  ONLINE = "ONLINE",
  LIVE = "LIVE",
}

export type SingleMatchResponseDTO = {
  matchId: number;
  matchName: string | null;
  startTime: string;
  endTime?: string | null;
  gameSystemId: number;
  gameSystemName: string;
  player1Id: number;
  player1Name: string;
  player1ready: number;
  player2Id: number | null;
  player2Name: string;
  player2ready: number;
  hotSeat: boolean;
  mode: MatchMode;
};

export type CreateSingleMatchDTO = {
  matchName?: string;
  gameSystemId: number;
  player2Id?: number | null;
  guestPlayer2Name?: string;
  primaryMissionId?: number | null;
  deploymentId?: number | null;
  armyPower?: number | null;
  firstPlayerId?: number | null;
  mode?: MatchMode;
};

export type MatchStatusDTO = {
  matchId: number;
  status: string;
  player1Ready: boolean;
  player2Ready: boolean;
};

export enum ScoreType {
  MAIN_SCORE = "MAIN_SCORE",
  SECONDARY_SCORE = "SECONDARY_SCORE",
  THIRD_SCORE = "THIRD_SCORE",
  ADDITIONAL_SCORE = "ADDITIONAL_SCORE",
}

export type RoundTableRowDTO = {
  roundNumber: number;
  player1: Record<ScoreType, number>;
  player2: Record<ScoreType, number>;
};

export type MatchSummaryDTO = {
  matchId: number;
  matchName: string | null;
  mode: MatchMode;
  player1Name: string;
  player2Name: string;
  primaryMission: string | null;
  deployment: string | null;
  armyPower: number | null;
  startTime: string;
  endTime: string | null;
  ready: boolean;
  opponentReady: boolean;
  primaryScoreEnabled: boolean;
  secondaryScoreEnabled: boolean;
  thirdScoreEnabled: boolean;
  additionalScoreEnabled: boolean;
  rounds: RoundTableRowDTO[];
  totalsByPlayerAndType: Record<string, Record<ScoreType, number>>;
  totalPointsByPlayer: Record<string, number>;
};
