"use client";

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AppUser = {
  id: string;
  email: string | null;
  full_name?: string | null;
  role?: "customer" | "staff" | "admin" | "superadmin";
  phone?: string | null;
  avatar_url?: string | null;
};

interface UserProfile {
  id: string;
  full_name: string | null;
  role: "customer" | "staff" | "admin" | "superadmin";
  phone: string | null;
  avatar_url: string | null;
  email: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

async function fetchMe(): Promise<AppUser | null> {
  // This relies on your httpOnly cookie "auth_token"
  const res = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { user?: AppUser | null };
  return data.user ?? null;
}

function toProfile(me: AppUser | null): UserProfile | null {
  if (!me) return null;
  return {
    id: me.id,
    full_name: me.full_name ?? null,
    role: me.role ?? "customer",
    phone: me.phone ?? null,
    avatar_url: me.avatar_url ?? null,
    email: me.email ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const me = await fetchMe();
    setUser(me);
    setProfile(toProfile(me));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const me = await fetchMe();

        if (cancelled) return;
        setUser(me);

        setProfile(toProfile(me));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      refreshProfile,
    }),
    [user, profile, loading, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
