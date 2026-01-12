import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, DollarSign, Users, Star, TrendingUp } from "lucide-react"
import { AnalyticsCharts } from "@/components/admin/analytics-charts"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get stats
  const [bookingsResult, revenueResult, usersResult, reviewsResult] = await Promise.all([
    supabase.from("bookings").select("id, status"),
    supabase.from("bookings").select("id, payment_status, services(price)").eq("payment_status", "paid"),
    supabase.from("user_profiles").select("id"),
    supabase.from("reviews").select("rating"),
  ])

  const totalBookings = bookingsResult.data?.length || 0
  const upcomingBookings = bookingsResult.data?.filter((b) => b.status === "confirmed").length || 0
  const totalRevenue = revenueResult.data?.reduce((sum: number, b: any) => sum + Number(b.services?.price || 0), 0) || 0
  const avgRating =
    reviewsResult.data && reviewsResult.data.length > 0
      ? reviewsResult.data.reduce((sum, r) => sum + r.rating, 0) / reviewsResult.data.length
      : 0
  const cancellationRate =
    totalBookings > 0
      ? ((bookingsResult.data?.filter((b) => b.status === "cancelled").length || 0) / totalBookings) * 100
      : 0

  return (
    <DashboardLayout>
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={totalBookings}
          icon={Calendar}
          change={12.5}
          changeLabel="from last month"
        />
        <StatCard
          title="Revenue"
          value={`$${totalRevenue.toFixed(0)}`}
          icon={DollarSign}
          change={8.2}
          changeLabel="from last month"
        />
        <StatCard
          title="Upcoming"
          value={upcomingBookings}
          icon={TrendingUp}
          change={4.1}
          changeLabel="from last week"
        />
        <StatCard title="Avg Rating" value={avgRating.toFixed(1)} icon={Star} />
      </div>

      {/* Analytics */}
      <AnalyticsCharts />

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cancellation Rate</span>
              <span className="text-sm font-medium">{cancellationRate.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Reviews</span>
              <span className="text-sm font-medium">{reviewsResult.data?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Users</span>
              <span className="text-sm font-medium">{usersResult.data?.length || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/admin/services">
                <Calendar className="mr-2 size-4" />
                Manage Services
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/admin/bookings">
                <Users className="mr-2 size-4" />
                View All Bookings
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/admin/staff">
                <Users className="mr-2 size-4" />
                Manage Staff
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
