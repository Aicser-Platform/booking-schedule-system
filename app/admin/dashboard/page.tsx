import { redirect } from "next/navigation";
import { headers } from "next/headers";

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
import Link from "next/link";
import { Calendar, DollarSign, Users, Star, TrendingUp } from "lucide-react";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";

type MeUser = {
  id: string;
  email: string;
  role: "customer" | "staff" | "admin" | "superadmin";
  full_name?: string | null;
};

type AdminDashboardStats = {
  totalBookings: number;
  upcomingBookings: number;
  totalRevenue: number;
  avgRating: number;
  cancellationRate: number;
  totalReviews: number;
  activeUsers: number;
};

async function getMe(): Promise<MeUser | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  const res = await fetch(`${apiUrl}/api/auth/me`, {
    method: "GET",
    headers: { Cookie: cookie },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return (await res.json()) as MeUser;
}

async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  // Backend endpoint you should create:
  // GET /api/analytics/admin-dashboard
  try {
    const res = await fetch(`${apiUrl}/api/analytics/admin-dashboard`, {
      method: "GET",
      headers: { Cookie: cookie },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        totalBookings: 0,
        upcomingBookings: 0,
        totalRevenue: 0,
        avgRating: 0,
        cancellationRate: 0,
        totalReviews: 0,
        activeUsers: 0,
      };
    }

    const data = await res.json();

    return {
      totalBookings: Number(data?.totalBookings ?? 0),
      upcomingBookings: Number(data?.upcomingBookings ?? 0),
      totalRevenue: Number(data?.totalRevenue ?? 0),
      avgRating: Number(data?.avgRating ?? 0),
      cancellationRate: Number(data?.cancellationRate ?? 0),
      totalReviews: Number(data?.totalReviews ?? 0),
      activeUsers: Number(data?.activeUsers ?? 0),
    };
  } catch {
    return {
      totalBookings: 0,
      upcomingBookings: 0,
      totalRevenue: 0,
      avgRating: 0,
      cancellationRate: 0,
      totalReviews: 0,
      activeUsers: 0,
    };
  }
}

export default async function AdminDashboard() {
  // ── Auth / Role guard ─────────────────────────
  const me = await getMe();
  if (!me) redirect("/auth/login");
  if (me.role !== "admin" && me.role !== "superadmin") redirect("/dashboard");

  // ── Stats ─────────────────────────────────────
  const stats = await getAdminDashboardStats();

  return (
    <DashboardLayout>
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Calendar}
          change={12.5}
          changeLabel="from last month"
        />
        <StatCard
          title="Revenue"
          value={`$${stats.totalRevenue.toFixed(0)}`}
          icon={DollarSign}
          change={8.2}
          changeLabel="from last month"
        />
        <StatCard
          title="Upcoming"
          value={stats.upcomingBookings}
          icon={TrendingUp}
          change={4.1}
          changeLabel="from last week"
        />
        <StatCard
          title="Avg Rating"
          value={stats.avgRating.toFixed(1)}
          icon={Star}
        />
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
              <span className="text-sm text-muted-foreground">
                Cancellation Rate
              </span>
              <span className="text-sm font-medium">
                {stats.cancellationRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Reviews
              </span>
              <span className="text-sm font-medium">{stats.totalReviews}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Active Users
              </span>
              <span className="text-sm font-medium">{stats.activeUsers}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              <Link href="/admin/services">
                <Calendar className="mr-2 size-4" />
                Manage Services
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              <Link href="/admin/bookings">
                <Users className="mr-2 size-4" />
                View All Bookings
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              <Link href="/admin/staff">
                <Users className="mr-2 size-4" />
                Manage Staff
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
