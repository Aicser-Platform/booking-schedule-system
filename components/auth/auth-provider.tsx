"use client";

import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AppUser = {
  id: string;
  email: string | null;
};

interface UserProfile {
  id: string;
  full_name: string | null;
  role: "customer" | "staff" | "admin";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchProfile = async (userId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/users/${userId}/profile`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        // If your backend doesn’t have this endpoint yet, you can either:
        // 1) implement it, OR
        // 2) remove profile usage in UI until implemented
        setProfile(null);
        return;
      }

      const data = (await response.json()) as UserProfile;
      setProfile(data);
    } catch (error) {
      console.error("[auth-provider] Failed to fetch profile:", error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const me = await fetchMe();

        if (cancelled) return;
        setUser(me);

        if (me?.id) {
          await fetchProfile(me.id);
        } else {
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    // Optional: keep tabs in sync (logout/login in another tab)
    const onFocus = () => {
      load();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      refreshProfile,
    }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
