import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export default async function StaffSchedulePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "staff" && profile?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">My Schedule</h2>
        <p className="text-muted-foreground">View your complete appointment schedule</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="mb-4 size-12 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium">Schedule Calendar</p>
            <p className="text-sm text-muted-foreground">Your full schedule will appear here</p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
