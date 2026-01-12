import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, Users, Calendar } from "lucide-react"
import { AnalyticsCharts } from "@/components/admin/analytics-charts"

export default async function AdminAnalyticsPage() {
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

  // Fetch analytics data
  const [bookingsResult, revenueResult, usersResult] = await Promise.all([
    supabase.from("bookings").select("id, status, created_at"),
    supabase.from("bookings").select("services(price)").eq("payment_status", "paid"),
    supabase.from("user_profiles").select("id, created_at"),
  ])

  const totalBookings = bookingsResult.data?.length || 0
  const totalRevenue = revenueResult.data?.reduce((sum: number, b: any) => sum + Number(b.services?.price || 0), 0) || 0
  const totalUsers = usersResult.data?.length || 0

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Analytics & Reports</h2>
        <p className="text-muted-foreground">Comprehensive insights into your business performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Bookings" value={totalBookings} icon={Calendar} change={18.2} />
        <StatCard title="Revenue" value={`$${totalRevenue.toFixed(0)}`} icon={DollarSign} change={12.5} />
        <StatCard title="Active Users" value={totalUsers} icon={Users} change={24.8} />
        <StatCard title="Growth Rate" value="15.3%" icon={TrendingUp} change={5.2} />
      </div>

      <AnalyticsCharts />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Top Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
