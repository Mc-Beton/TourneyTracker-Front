import { http } from "./http";
import type {
  TournamentDetailsDTO,
  TournamentListItemDTO,
} from "../types/tournament";

export function getTournaments() {
  return http<TournamentListItemDTO[]>("/api/tournaments");
}

export function getTournamentById(id: number) {
  return http<TournamentDetailsDTO>(`/api/tournaments/${id}`);
}

const API_BASE = "http://localhost:8080";

import type {
  CreateTournamentDTO,
  TournamentDetails,
} from "../types/tournament";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    // spróbujmy wyciągnąć message z backendu
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  // 204 no content
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

export function createTournament(
  payload: CreateTournamentDTO
): Promise<TournamentDetails> {
  return request<TournamentDetails>(API_BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
