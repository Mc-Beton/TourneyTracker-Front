import { http } from "./http";
import { ArmyListStatus } from "../types/participant";

export interface SubmitArmyListRequest {
  armyFactionId: number;
  armyId: number;
  armyListContent: string;
}

export interface ArmyListDetails {
  armyFactionName: string;
  armyName: string;
  armyListContent: string;
  status: ArmyListStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

export interface ReviewArmyListRequest {
  approved: boolean;
  rejectionReason?: string;
}

export const participantApi = {
  submitMyArmyList: async (
    tournamentId: number,
    data: SubmitArmyListRequest,
  ): Promise<void> => {
    await http(`/api/tournaments/${tournamentId}/participants/my-army-list`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMyArmyList: async (tournamentId: number): Promise<ArmyListDetails> => {
    return http<ArmyListDetails>(
      `/api/tournaments/${tournamentId}/participants/my-army-list`,
    );
  },

  getParticipantArmyList: async (
    tournamentId: number,
    userId: number,
  ): Promise<ArmyListDetails> => {
    return http<ArmyListDetails>(
      `/api/tournaments/${tournamentId}/participants/${userId}/army-list`,
    );
  },

  reviewArmyList: async (
    tournamentId: number,
    userId: number,
    data: ReviewArmyListRequest,
  ): Promise<void> => {
    await http(
      `/api/tournaments/${tournamentId}/participants/${userId}/army-list/review`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  togglePaymentStatus: async (
    tournamentId: number,
    userId: number,
    isPaid: boolean,
  ): Promise<void> => {
    await http(
      `/api/tournaments/${tournamentId}/participants/${userId}/payment?isPaid=${isPaid}`,
      {
        method: "PATCH",
      },
    );
  },
};
