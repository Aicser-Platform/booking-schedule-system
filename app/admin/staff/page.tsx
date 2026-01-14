import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Phone } from "lucide-react";

type MeUser = {
  id: string;
  email: string;
  role: "customer" | "staff" | "admin";
};

type StaffRow = {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  role: "staff" | "admin";
  is_active: boolean;
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

async function getStaff(): Promise<StaffRow[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  // Backend endpoint you should create:
  // GET /api/admin/staff
  // Should return staff/admin profiles ordered by full_name
  try {
    const res = await fetch(`${apiUrl}/api/admin/staff`, {
      method: "GET",
      headers: { Cookie: cookie },
      cache: "no-store",
    });

    if (!res.ok) return [];
    return (await res.json()) as StaffRow[];
  } catch {
    return [];
  }
}

export default async function AdminStaffPage() {
  const me = await getMe();
  if (!me) redirect("/auth/login");
  if (me.role !== "admin") redirect("/dashboard");

  const staffMembers = await getStaff();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold">Manage Staff</h1>
          <Button asChild variant="outline">
            <Link href="/admin/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <div className="container py-8">
        {staffMembers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {staffMembers.map((staff) => (
              <Card key={staff.id}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={staff.avatar_url || undefined} />
                      <AvatarFallback>
                        {staff.full_name?.charAt(0) || "S"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {staff.full_name || "Staff Member"}
                      </CardTitle>

                      <Badge
                        variant={
                          staff.role === "admin" ? "default" : "secondary"
                        }
                        className="mt-1"
                      >
                        {staff.role}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  {staff.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{staff.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Badge
                      variant={staff.is_active ? "default" : "destructive"}
                    >
                      {staff.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">No staff members found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
