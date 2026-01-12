import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

type MeUser = {
  id: string;
  email: string;
  role: "customer" | "staff" | "admin";
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

export default async function StaffSchedulePage() {
  const me = await getMe();
  if (!me) redirect("/auth/login");
  if (me.role !== "staff" && me.role !== "admin") redirect("/dashboard");

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">My Schedule</h2>
        <p className="text-muted-foreground">
          View your complete appointment schedule
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="mb-4 size-12 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium">Schedule Calendar</p>
            <p className="text-sm text-muted-foreground">
              Your full schedule will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
