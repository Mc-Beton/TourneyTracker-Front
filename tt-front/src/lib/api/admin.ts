const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminToken");
}

function getHeaders() {
  const token = getAdminToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export type GameSystemDTO = {
  id: number;
  name: string;
  defaultRoundNumber: number;
  primaryScoreEnabled: boolean;
  secondaryScoreEnabled: boolean;
  thirdScoreEnabled: boolean;
  additionalScoreEnabled: boolean;
};

export type CreateGameSystemDTO = {
  name: string;
  defaultRoundNumber: number;
  primaryScoreEnabled?: boolean;
  secondaryScoreEnabled?: boolean;
  thirdScoreEnabled?: boolean;
  additionalScoreEnabled?: boolean;
};

export type UpdateGameSystemDTO = Partial<CreateGameSystemDTO>;

export type IdNameDTO = {
  id: number;
  name: string;
};

export type CreateArmyFactionDTO = {
  name: string;
  gameSystemId: number;
};

export type CreateArmyDTO = {
  name: string;
  armyFactionId: number;
};

export type CreateDeploymentDTO = {
  name: string;
  gameSystemId: number;
};

export type CreatePrimaryMissionDTO = {
  name: string;
  gameSystemId: number;
};

// ==================== GAME SYSTEMS ====================

export async function getAllGameSystems(): Promise<GameSystemDTO[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/game-systems`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch game systems");
  return res.json();
}

export async function getGameSystem(id: number): Promise<GameSystemDTO> {
  const res = await fetch(`${API_BASE_URL}/api/admin/game-systems/${id}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch game system");
  return res.json();
}

export async function createGameSystem(
  data: CreateGameSystemDTO,
): Promise<GameSystemDTO> {
  const res = await fetch(`${API_BASE_URL}/api/admin/game-systems`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create game system");
  return res.json();
}

export async function updateGameSystem(
  id: number,
  data: UpdateGameSystemDTO,
): Promise<GameSystemDTO> {
  const res = await fetch(`${API_BASE_URL}/api/admin/game-systems/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update game system");
  return res.json();
}

export async function deleteGameSystem(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/admin/game-systems/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete game system");
}

// ==================== ARMY FACTIONS ====================

export async function getArmyFactions(
  gameSystemId: number,
): Promise<IdNameDTO[]> {
  const res = await fetch(
    `${API_BASE_URL}/api/admin/game-systems/${gameSystemId}/army-factions`,
    {
      headers: getHeaders(),
    },
  );
  if (!res.ok) throw new Error("Failed to fetch army factions");
  return res.json();
}

export async function createArmyFaction(
  data: CreateArmyFactionDTO,
): Promise<any> {
  const res = await fetch(
    `${API_BASE_URL}/api/admin/game-systems/army-factions`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    },
  );
  if (!res.ok) throw new Error("Failed to create army faction");
  return res.json();
}

export async function updateArmyFaction(
  id: number,
  name: string,
): Promise<any> {
  const res = await fetch(
    `${API_BASE_URL}/api/admin/game-systems/army-factions/${id}?name=${encodeURIComponent(name)}`,
    {
      method: "PUT",
      headers: getHeaders(),
    },
  );
  if (!res.ok) throw new Error("Failed to update army faction");
  return res.json();
}

export async function deleteArmyFaction(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/api/admin/game-systems/army-factions/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  );
  if (!res.ok) throw new Error("Failed to delete army faction");
}

// ==================== ARMIES ====================

export async function getArmies(factionId: number): Promise<IdNameDTO[]> {
  const res = await fetch(
    `${API_BASE_URL}/api/admin/game-systems/army-factions/${factionId}/armies`,
    {
      headers: getHeaders(),
    },
  );
  if (!res.ok) throw new Error("Failed to fetch armies");
  return res.json();
}

export async function createArmy(data: CreateArmyDTO): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/admin/game-systems/armies`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create army");
  return res.json();
}

export async function updateArmy(id: number, name: string): Promise<any> {
  const res = await fetch(
    `${API_BASE_URL}/api/admin/game-systems/armies/${id}?name=${encodeURIComponent(name)}`,
    {
      method: "PUT",
      headers: getHeaders(),
    },
  );
  if (!res.ok) throw new Error("Failed to update army");
  return res.json();
}

export async function deleteArmy(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/api/admin/game-systems/armies/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  );
  if (!res.ok) throw new Error("Failed to delete army");
}

// ==================== DEPLOYMENTS ====================

export async function getDeployments(
  gameSystemId: number,
): Promise<IdNameDTO[]> {
  const res = await fetch(
    `${API_BASE_URL}/api/admin/game-systems/${gameSystemId}/deployments`,
    {
      headers: getHeaders(),
    },
  );
  if (!res.ok) throw new Error("Failed to fetch deployments");
  return res.json();
}

export async function createDeployment(
  data: CreateDeploymentDTO,
): Promise<any> {
  const res = await fetch(
    `${API_BASE_URL}/api/admin/game-systems/deployments`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    },
  );
  if (!res.ok) throw new Error("Failed to create deployment");
  return res.json();
}

export async function updateDeployment(id: number, name: string): Promise<any> {
  const res = await fetch(
    `${API_BASE_URL}/api/admin/game-systems/deployments/${id}?name=${encodeURIComponent(name)}`,
    {
      method: "PUT",
      headers: getHeaders(),
    },
  );
  if (!res.ok) throw new Error("Failed to update deployment");
  return res.json();
}

export async function deleteDeployment(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/api/admin/game-systems/deployments/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  );
  if (!res.ok) throw new Error("Failed to delete deployment");
}

// ==================== PRIMARY MISSIONS ====================

export async function getPrimaryMissions(
  gameSystemId: number,
): Promise<IdNameDTO[]> {
  const res = await fetch(
    `${API_BASE_URL}/api/admin/game-systems/${gameSystemId}/primary-missions`,
    {
      headers: getHeaders(),
    },
  );
  if (!res.ok) throw new Error("Failed to fetch primary missions");
  return res.json();
}

export async function createPrimaryMission(
  data: CreatePrimaryMissionDTO,
): Promise<any> {
  const res = await fetch(
    `${API_BASE_URL}/api/admin/game-systems/primary-missions`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    },
  );
  if (!res.ok) throw new Error("Failed to create primary mission");
  return res.json();
}

export async function updatePrimaryMission(
  id: number,
  name: string,
): Promise<any> {
  const res = await fetch(
    `${API_BASE_URL}/api/admin/game-systems/primary-missions/${id}?name=${encodeURIComponent(name)}`,
    {
      method: "PUT",
      headers: getHeaders(),
    },
  );
  if (!res.ok) throw new Error("Failed to update primary mission");
  return res.json();
}

export async function deletePrimaryMission(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/api/admin/game-systems/primary-missions/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  );
  if (!res.ok) throw new Error("Failed to delete primary mission");
}
