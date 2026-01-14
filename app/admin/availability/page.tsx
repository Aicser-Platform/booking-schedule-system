import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

type MeUser = {
  id: string;
  email: string;
  full_name?: string | null;
  role: "customer" | "staff" | "admin";
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
  if (me.role !== "admin") redirect("/dashboard");

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

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Holiday & Block Dates</CardTitle>
          <CardDescription>
            Set dates when booking should be blocked
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="mb-4 size-12 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium">Availability Manager</p>
            <p className="mb-4 text-sm text-muted-foreground">
              Configure working hours and exceptions
            </p>
            <Button>Configure Availability</Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
