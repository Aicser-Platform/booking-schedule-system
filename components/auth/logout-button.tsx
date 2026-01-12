"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error logging out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleLogout} disabled={isLoading} variant="ghost" size="sm">
      <LogOut className="mr-2 h-4 w-4" />
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  )
}
