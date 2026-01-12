import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, DollarSign, Users, Phone, Mail } from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { EmptyState } from "@/components/dashboard/empty-state";

type MeUser = {
  id: string;
  email: string;
  role: "customer" | "staff" | "admin";
};

type BookingRow = {
  id: string;
  start_time_utc: string;
  status: "confirmed" | "cancelled" | "pending" | string;

  services?: {
    name?: string | null;
    duration_minutes?: number | null;
    price?: number | null;
  } | null;

  customers?: {
    full_name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
};

type StaffDashboardData = {
  todayBookings: BookingRow[];
  upcomingBookings: BookingRow[];
  totalRevenue: number;
  totalBookings: number;
};

async function getMe(): Promise<MeUser | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  const res = await fetch(`${apiUrl}/api/auth/me`, {
    method: "GET",
    headers: { Cookie: cookie },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return (await res.json()) as MeUser;
}

async function getStaffDashboard(): Promise<StaffDashboardData> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  // Backend endpoint you should create:
  // GET /api/staff/dashboard
  // Response:
  // {
  //   todayBookings: BookingRow[],
  //   upcomingBookings: BookingRow[],
  //   totalRevenue: number,
  //   totalBookings: number
  // }
  //
  // NOTE: Best practice: compute today/upcoming ranges on the backend
  // using staff's timezone rules, then return ready-to-render data.
  try {
    const res = await fetch(`${apiUrl}/api/staff/dashboard`, {
      method: "GET",
      headers: { Cookie: cookie },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        todayBookings: [],
        upcomingBookings: [],
        totalRevenue: 0,
        totalBookings: 0,
      };
    }
    return (await res.json()) as StaffDashboardData;
  } catch {
    return {
      todayBookings: [],
      upcomingBookings: [],
      totalRevenue: 0,
      totalBookings: 0,
    };
  }
}

export default async function StaffDashboard() {
  const me = await getMe();
  if (!me) redirect("/auth/login");
  if (me.role !== "staff" && me.role !== "admin") redirect("/dashboard");

  // If you *don't* have /api/staff/dashboard yet, you can replace this with
  // two fetches (today/upcoming) + one stats fetch. But one endpoint is cleaner.
  const { todayBookings, upcomingBookings, totalRevenue, totalBookings } =
    await getStaffDashboard();

  return (
    <DashboardLayout>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Today's Appointments"
          value={todayBookings.length}
          icon={Calendar}
          change={15.3}
        />
        <StatCard title="Total Bookings" value={totalBookings} icon={Users} />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          change={8.7}
        />
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
          {todayBookings.length > 0 ? (
            todayBookings.map((booking) => (
              <Card key={booking.id} className="glass-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>
                        {booking.services?.name || "Service"}
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(booking.start_time_utc), "h:mm a")}
                      </CardDescription>
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
                      <span>{booking.customers?.full_name || "Customer"}</span>
                    </div>

                    {!!booking.customers?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="size-4 text-muted-foreground" />
                        <span>{booking.customers.phone}</span>
                      </div>
                    )}

                    {!!booking.customers?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="size-4 text-muted-foreground" />
                        <span>{booking.customers.email}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" />
                      <span>
                        {booking.services?.duration_minutes || 0} minutes
                      </span>
                    </div>
                  </div>

                  {/* UI-only until you add endpoints/actions */}
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
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <Card key={booking.id} className="glass-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>
                        {booking.services?.name || "Service"}
                      </CardTitle>
                      <CardDescription>
                        {format(
                          new Date(booking.start_time_utc),
                          "MMMM d, yyyy 'at' h:mm a"
                        )}
                      </CardDescription>
                    </div>

                    <Badge
                      variant={
                        booking.status === "confirmed" ? "default" : "secondary"
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
                      <span>{booking.customers?.full_name || "Customer"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" />
                      <span>
                        {booking.services?.duration_minutes || 0} minutes
                      </span>
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
  );
}
