export enum ArmyListStatus {
  NOT_SUBMITTED = "NOT_SUBMITTED",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface TournamentParticipant {
  userId: number;
  name: string;
  email: string;
  confirmed: boolean;
  isPaid: boolean;
  armyListStatus: ArmyListStatus;
  armyFactionName: string | null;
  armyName: string | null;
}

export interface ArmyFaction {
  id: number;
  name: string;
}

export interface Army {
  id: number;
  name: string;
}
