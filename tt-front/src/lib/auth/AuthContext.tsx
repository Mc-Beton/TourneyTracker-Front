"use client";

import { createContext } from "react";

export type AuthState = {
  token: string | null;
  username: string | null;
  userId: number | null;
  isAuthenticated: boolean;
  login: (
    token: string,
    username?: string | null,
    userId?: number | null
  ) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthState | null>(null);
