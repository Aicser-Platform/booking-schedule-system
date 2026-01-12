import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export default async function AdminAvailabilityPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Availability Management</h2>
        <p className="text-muted-foreground">Configure staff schedules and holiday blocking</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Holiday & Block Dates</CardTitle>
          <CardDescription>Set dates when booking should be blocked</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="mb-4 size-12 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium">Availability Manager</p>
            <p className="mb-4 text-sm text-muted-foreground">Configure working hours and exceptions</p>
            <Button>Configure Availability</Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
