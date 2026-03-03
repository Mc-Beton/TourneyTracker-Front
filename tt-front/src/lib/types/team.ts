export interface Team {
  id: number;
  name: string;
  abbreviation: string;
  city: string;
  description: string;
  ownerId: number;
  ownerName: string;
  gameSystemId: number;
  gameSystemName: string;
  createdAt: string;
  memberCount: number;
  isOwner: boolean;
  isMember: boolean;
}

export interface CreateTeamRequest {
  name: string;
  abbreviation: string;
  city: string;
  description: string;
  gameSystemId: number;
}

export enum TeamMemberStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
}

export interface TeamMember {
  id: number;
  teamId: number;
  userId: number;
  userName: string;
  status: TeamMemberStatus;
  joinedAt: string;
}
