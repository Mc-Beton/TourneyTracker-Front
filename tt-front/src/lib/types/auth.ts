export type RegisterDTO = {
  name: string;
  email: string;
  password: string;
  captchaToken: string;
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

export type UserProfileDTO = {
  id: number;
  name: string;
  realName?: string;
  surname?: string;
  email: string;
  team?: string;
  city?: string;
  discordNick?: string;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRatio: number;
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
