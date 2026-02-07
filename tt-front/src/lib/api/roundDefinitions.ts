import { http } from "./http";
import type {
  TournamentRoundDefinitionDTO,
  UpdateRoundDefinitionDTO,
} from "../types/roundDefinition";

export async function getRoundDefinitions(
  tournamentId: number,
  token?: string | null,
): Promise<TournamentRoundDefinitionDTO[]> {
  return http<TournamentRoundDefinitionDTO[]>(
    `/api/tournaments/${tournamentId}/round-definitions`,
    {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
}

export async function updateRoundDefinition(
  tournamentId: number,
  roundNumber: number,
  data: UpdateRoundDefinitionDTO,
  token: string,
): Promise<TournamentRoundDefinitionDTO> {
  return http<TournamentRoundDefinitionDTO>(
    `/api/tournaments/${tournamentId}/round-definitions/${roundNumber}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  );
}
