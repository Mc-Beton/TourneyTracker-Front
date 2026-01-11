"use client";

import { useMemo, useState } from "react";
import { AuthContext, type AuthState } from "./AuthContext";
import {
  clearAuth,
  readToken,
  readUsername,
  readUserId,
  writeAuth,
} from "./authStorage";

function decodeJWT(token: string): { email?: string; userId?: number } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const decoded = JSON.parse(atob(payload));
    return {
      email: decoded.sub || decoded.email,
      userId: decoded.userId || decoded.id,
    };
  } catch {
    return null;
  }
}

function tryGetEmailFromJwt(token: string): string | null {
  const decoded = decodeJWT(token);
  return decoded?.email || null;
}

function tryGetUserIdFromJwt(token: string): number | null {
  const decoded = decodeJWT(token);
  return decoded?.userId || null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readToken());
  const [username, setUsername] = useState<string | null>(() => {
    const t = readToken();
    return (t ? tryGetEmailFromJwt(t) : null) ?? readUsername();
  });
  const [userId, setUserId] = useState<number | null>(() => {
    const t = readToken();
    return (t ? tryGetUserIdFromJwt(t) : null) ?? readUserId();
  });

  const value = useMemo<AuthState>(() => {
    return {
      token,
      username,
      userId,
      isAuthenticated: !!token,

      login: (newToken, explicitUsername, explicitUserId) => {
        const decodedEmail = tryGetEmailFromJwt(newToken);
        const decodedUserId = tryGetUserIdFromJwt(newToken);
        const u = explicitUsername ?? decodedEmail ?? null;
        const uid = explicitUserId ?? decodedUserId ?? null;
        setToken(newToken);
        setUsername(u);
        setUserId(uid);
        writeAuth(newToken, u, uid);
      },

      logout: () => {
        setToken(null);
        setUsername(null);
        setUserId(null);
        clearAuth();
      },
    };
  }, [token, username, userId]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
