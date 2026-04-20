"use client";

import { useEffect, useState, useCallback } from "react";

type SessionUser = {
  username: string;
  walletAddress: string;
};

/**
 * Returns auth state scoped to the given wallet address.
 * Session is only considered "authenticated" if the session cookie's
 * walletAddress matches the current wallet address (case-insensitive).
 */
export function useTwitterSession(currentAddress: string | undefined) {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", {
        credentials: "same-origin",
      });
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addressMatches =
    !!user &&
    !!currentAddress &&
    user.walletAddress?.toLowerCase() === currentAddress.toLowerCase();

  const login = useCallback(() => {
    if (!currentAddress) return;
    window.location.href = `/api/auth/twitter/login?address=${currentAddress.toLowerCase()}`;
  }, [currentAddress]);

  return {
    isAuthenticated: addressMatches,
    isLoading: user === undefined,
    login,
    refresh,
  };
}
