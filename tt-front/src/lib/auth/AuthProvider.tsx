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

function decodeJWT(
  token: string,
): { email?: string; userId?: number; exp?: number } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const decoded = JSON.parse(atob(payload));
    return {
      email: decoded.sub || decoded.email,
      userId: decoded.userId || decoded.id,
      exp: decoded.exp,
    };
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded?.exp) return true;

  // exp jest w sekundach, Date.now() w milisekundach
  return decoded.exp * 1000 < Date.now();
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
  const [token, setToken] = useState<string | null>(() => {
    const t = readToken();
    // Sprawdź czy token nie wygasł
    if (t && isTokenExpired(t)) {
      clearAuth();
      return null;
    }
    return t;
  });
  const [username, setUsername] = useState<string | null>(() => {
    const t = readToken();
    if (t && isTokenExpired(t)) {
      return null;
    }
    return (t ? tryGetEmailFromJwt(t) : null) ?? readUsername();
  });
  const [userId, setUserId] = useState<number | null>(() => {
    const t = readToken();
    if (t && isTokenExpired(t)) {
      return null;
    }
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
