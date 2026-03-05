// Re-export or adapt existing types if needed, otherwise define minimally.
export interface UserDTO {
  id: number;
  name: string;
  // Add other fields as needed
}

export interface GameSystemDTO {
  id: number;
  name: string;
}

export interface SingleMatchResponseDTO {
  matchId: number;
  matchName: string | null;
  startTime: string;
  // ... complete based on needs
}

export interface TournamentResponseDTO {
  id: number;
  name: string;
  startDate: string;
  // ...
}
