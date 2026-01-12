"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

interface UserProfile {
  id: string
  full_name: string | null
  role: "customer" | "staff" | "admin"
  phone: string | null
  avatar_url: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/api/users/${userId}/profile`)

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {
        // If profile doesn't exist in backend, use metadata from auth
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user?.user_metadata) {
          setProfile({
            id: userId,
            full_name: user.user_metadata.full_name || null,
            role: user.user_metadata.role || "customer",
            phone: user.user_metadata.phone || null,
            avatar_url: null,
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      // Fallback to user metadata
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.user_metadata) {
        setProfile({
          id: userId,
          full_name: user.user_metadata.full_name || null,
          role: user.user_metadata.role || "customer",
          phone: user.user_metadata.phone || null,
          avatar_url: null,
        })
      }
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        await fetchProfile(user.id)
      }

      setLoading(false)
    }

    fetchUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
