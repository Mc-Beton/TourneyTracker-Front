export type TournamentRoundDefinitionDTO = {
  id: number;
  roundNumber: number;
  deploymentId: number | null;
  deploymentName: string | null;
  primaryMissionId: number | null;
  primaryMissionName: string | null;
  isSplitMapLayout: boolean;
  mapLayoutEven: string | null;
  mapLayoutOdd: string | null;
  byeLargePoints: number;
  byeSmallPoints: number;
  splitLargePoints: number;
  splitSmallPoints: number;
};

export type UpdateRoundDefinitionDTO = {
  deploymentId?: number | null;
  primaryMissionId?: number | null;
  isSplitMapLayout?: boolean;
  mapLayoutEven?: string | null;
  mapLayoutOdd?: string | null;
  byeLargePoints?: number;
  byeSmallPoints?: number;
  splitLargePoints?: number;
  splitSmallPoints?: number;
};
