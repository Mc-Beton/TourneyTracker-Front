import { http } from "./http";
import { CreateTeamRequest, Team, TeamMember } from "../types/team";

export const getMyTeams = async (): Promise<Team[]> => {
  return http<Team[]>("/api/teams/my");
};

export const getAllTeams = async (): Promise<Team[]> => {
  return http<Team[]>("/api/teams");
};

export const getTeam = async (id: number): Promise<Team> => {
  return http<Team>(`/api/teams/${id}`);
};

export const createTeam = async (data: CreateTeamRequest): Promise<Team> => {
  return http<Team>("/api/teams", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const joinTeam = async (id: number): Promise<void> => {
  return http<void>(`/api/teams/${id}/join`, {
    method: "POST",
  });
};

export const leaveTeam = async (id: number): Promise<void> => {
  return http<void>(`/api/teams/${id}/leave`, {
    method: "POST",
  });
};

export const getTeamMembers = async (id: number): Promise<TeamMember[]> => {
  return http<TeamMember[]>(`/api/teams/${id}/members`);
};

export const acceptMember = async (
  teamId: number,
  memberId: number,
): Promise<void> => {
  return http<void>(`/api/teams/${teamId}/members/${memberId}/accept`, {
    method: "PUT",
  });
};

export const kickMember = async (
  teamId: number,
  memberId: number,
): Promise<void> => {
  return http<void>(`/api/teams/${teamId}/members/${memberId}`, {
    method: "DELETE",
  });
};
