"use client";

import { http } from "./http";
import type {
  TournamentDetailsDTO,
  TournamentListItemDTO,
  CreateTournamentDTO,
  TournamentDetails,
  TournamentParticipantDTO,
} from "../types/tournament";

export function getTournaments() {
  return http<TournamentListItemDTO[]>("/api/tournaments");
}

export function getTournamentById(id: number) {
  return http<TournamentDetailsDTO>(`/api/tournaments/${id}`);
}

export function getTournamentEditForm(id: number, token: string) {
  return http<CreateTournamentDTO>(`/api/tournaments/${id}/edit`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function createTournament(
  payload: CreateTournamentDTO,
  token: string,
): Promise<TournamentDetails> {
  return http<TournamentDetails>("/api/tournaments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function getMyTournaments(token: string) {
  return http<TournamentListItemDTO[]>("/api/tournaments/mine", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateTournament(
  id: number,
  payload: CreateTournamentDTO,
  token: string,
): Promise<TournamentDetails> {
  return http<TournamentDetails>(`/api/tournaments/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function deleteTournament(id: number, token: string): Promise<void> {
  return http<void>(`/api/tournaments/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function setTournamentActive(
  id: number,
  active: boolean,
  token: string,
): Promise<TournamentDetails> {
  return http<TournamentDetails>(
    `/api/tournaments/${id}/active?active=${active}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function startTournament(
  id: number,
  token: string,
): Promise<TournamentDetails> {
  return http<TournamentDetails>(`/api/tournaments/${id}/start`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function addParticipant(
  tournamentId: number,
  userId: number,
  token: string,
): Promise<TournamentDetails> {
  return http<TournamentDetails>(
    `/api/tournaments/${tournamentId}/participants/${userId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function getPendingParticipants(
  tournamentId: number,
): Promise<TournamentParticipantDTO[]> {
  return http<TournamentParticipantDTO[]>(
    `/api/tournaments/${tournamentId}/users/pending`,
  );
}

export function getConfirmedParticipants(
  tournamentId: number,
): Promise<TournamentParticipantDTO[]> {
  return http<TournamentParticipantDTO[]>(
    `/api/tournaments/${tournamentId}/users/confirmed`,
  );
}

export function removeParticipant(
  tournamentId: number,
  userId: number,
  token: string,
): Promise<TournamentDetails> {
  return http<TournamentDetails>(
    `/api/tournaments/${tournamentId}/participants/${userId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function setParticipantConfirmation(
  tournamentId: number,
  userId: number,
  confirmed: boolean,
  token: string,
): Promise<TournamentDetails> {
  return http<TournamentDetails>(
    `/api/tournaments/${tournamentId}/participants/${userId}/confirm?confirmed=${confirmed}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
