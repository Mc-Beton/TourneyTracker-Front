export type RegisterDTO = {
  name: string;
  email: string;
  password: string;
};

export type LoginDTO = {
  email: string;
  password: string;
};

export type AuthUser = {
  name: string;
  email: string;
};

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  realName?: string;
  surname?: string;
  beginner?: boolean;
  team?: string;
  city?: string;
  discordNick?: string;
};

export type UpdateProfileDTO = {
  name?: string;
  email?: string;
  realName?: string;
  surname?: string;
  beginner?: boolean;
  team?: string;
  city?: string;
  discordNick?: string;
};
