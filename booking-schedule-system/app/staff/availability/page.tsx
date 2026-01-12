import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AvailabilityManager } from "@/components/staff/availability-manager"

export default async function StaffAvailabilityPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "staff" && profile?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center">
          <h1 className="text-xl font-bold">Manage Availability</h1>
        </div>
      </header>

      <div className="container py-8">
        <AvailabilityManager staffId={user.id} />
      </div>
    </div>
  )
}
