import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AvailabilityManager } from "@/components/staff/availability-manager";

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

export default async function StaffAvailabilityPage() {
  const me = await getMe();
  if (!me) redirect("/auth/login");
  if (me.role !== "staff" && me.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center">
          <h1 className="text-xl font-bold">Manage Availability</h1>
        </div>
      </header>

      <div className="container py-8">
        <AvailabilityManager staffId={me.id} />
      </div>
    </div>
  );
}
