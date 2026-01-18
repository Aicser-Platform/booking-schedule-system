import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { AvailabilityCalendar } from "@/components/availability/availability-calendar";
import { ScheduleApprovals } from "@/components/availability/schedule-approvals";

type MeUser = {
  id: string;
  email: string;
  full_name?: string | null;
  role: "customer" | "staff" | "admin" | "superadmin";
  phone?: string | null;
  avatar_url?: string | null;
};

async function getMe(): Promise<MeUser | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  const res = await fetch(`${apiUrl}/api/auth/me`, {
    method: "GET",
    headers: {
      Cookie: cookie, // forward auth_token cookie to backend
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return (await res.json()) as MeUser;
}

export default async function AdminAvailabilityPage() {
  const me = await getMe();

  // must be logged in
  if (!me) redirect("/auth/login");

  // must be admin
  if (me.role !== "admin" && me.role !== "superadmin") redirect("/dashboard");

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">
          Availability Management
        </h2>
        <p className="text-muted-foreground">
          Configure staff schedules and holiday blocking
        </p>
      </div>
      <AvailabilityCalendar mode="admin" />
      <div className="mt-6">
        <ScheduleApprovals />
      </div>
    </DashboardLayout>
  );
}
