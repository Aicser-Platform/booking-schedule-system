import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Calendar, Clock, DollarSign, Users, Phone, Mail } from "lucide-react"
import { format, startOfDay, endOfDay } from "date-fns"
import { EmptyState } from "@/components/dashboard/empty-state"

export default async function StaffDashboard() {
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

  const today = new Date()
  const { data: todayBookings } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services(name, duration_minutes),
      customers(full_name, phone, email)
    `,
    )
    .eq("staff_id", user.id)
    .gte("start_time_utc", startOfDay(today).toISOString())
    .lte("start_time_utc", endOfDay(today).toISOString())
    .order("start_time_utc")

  const { data: upcomingBookings } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services(name, duration_minutes),
      customers(full_name, phone, email)
    `,
    )
    .eq("staff_id", user.id)
    .gt("start_time_utc", endOfDay(today).toISOString())
    .order("start_time_utc")
    .limit(10)

  const { data: allBookings } = await supabase
    .from("bookings")
    .select("*, services(price)")
    .eq("staff_id", user.id)
    .eq("payment_status", "paid")

  const totalRevenue = allBookings?.reduce((sum: number, b: any) => sum + Number(b.services?.price || 0), 0) || 0
  const totalBookings = allBookings?.length || 0

  return (
    <DashboardLayout>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Today's Appointments" value={todayBookings?.length || 0} icon={Calendar} change={15.3} />
        <StatCard title="Total Bookings" value={totalBookings} icon={Users} />
        <StatCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={DollarSign} change={8.7} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="today" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
          <Button asChild>
            <Link href="/staff/availability">Manage Availability</Link>
          </Button>
        </div>

        <TabsContent value="today" className="space-y-4">
          {todayBookings && todayBookings.length > 0 ? (
            todayBookings.map((booking: any) => (
              <Card key={booking.id} className="glass-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{booking.services?.name}</CardTitle>
                      <CardDescription>{format(new Date(booking.start_time_utc), "h:mm a")}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        booking.status === "confirmed"
                          ? "default"
                          : booking.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-muted-foreground" />
                      <span>{booking.customers?.full_name}</span>
                    </div>
                    {booking.customers?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="size-4 text-muted-foreground" />
                        <span>{booking.customers.phone}</span>
                      </div>
                    )}
                    {booking.customers?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="size-4 text-muted-foreground" />
                        <span>{booking.customers.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" />
                      <span>{booking.services?.duration_minutes} minutes</span>
                    </div>
                  </div>
                  {booking.status === "confirmed" && (
                    <div className="mt-4 flex gap-2">
                      <Button size="sm">Mark Completed</Button>
                      <Button size="sm" variant="outline">
                        Mark No-Show
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={Calendar}
              title="No appointments today"
              description="Enjoy your day! You have no scheduled appointments for today."
            />
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings && upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking: any) => (
              <Card key={booking.id} className="glass-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{booking.services?.name}</CardTitle>
                      <CardDescription>
                        {format(new Date(booking.start_time_utc), "MMMM d, yyyy 'at' h:mm a")}
                      </CardDescription>
                    </div>
                    <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>{booking.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-muted-foreground" />
                      <span>{booking.customers?.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" />
                      <span>{booking.services?.duration_minutes} minutes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={Calendar}
              title="No upcoming appointments"
              description="You have no scheduled appointments coming up."
            />
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
