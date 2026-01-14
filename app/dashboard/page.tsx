import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { EmptyState } from "@/components/dashboard/empty-state";

type MeUser = {
  id: string;
  email: string;
  role: "customer" | "staff" | "admin";
};

type BookingRow = {
  id: string;
  service_name: string;
  start_time_utc: string;
  duration_minutes: number;
  price: number;
  staff_name?: string | null;
  status: "confirmed" | "cancelled" | "pending";
  payment_status?: string | null;
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

async function getMyBookings(meId: string): Promise<BookingRow[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  try {
    const res = await fetch(`${apiUrl}/api/bookings?customer_id=${meId}`, {
      method: "GET",
      headers: { Cookie: cookie },
      cache: "no-store",
    });

    if (!res.ok) return [];
    return (await res.json()) as BookingRow[];
  } catch {
    return [];
  }
}

export default async function CustomerDashboard() {
  const me = await getMe();
  if (!me) redirect("/auth/login");

  const bookings = await getMyBookings(me.id);

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Bookings</h2>
          <p className="text-muted-foreground">
            View and manage your appointments
          </p>
        </div>

        <Button asChild className="glow-primary-subtle">
          <Link href="/services">Book New Appointment</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <Card key={booking.id} className="glass-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{booking.service_name}</CardTitle>
                    <CardDescription>
                      {format(
                        new Date(booking.start_time_utc),
                        "MMMM d, yyyy 'at' h:mm a"
                      )}
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
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="size-4" />
                    <span>{booking.staff_name || "Staff Member"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="size-4" />
                    <span>{booking.duration_minutes} minutes</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="size-4" />
                    <span className="font-semibold">${booking.price}</span>
                    {booking.payment_status && (
                      <Badge variant="outline">{booking.payment_status}</Badge>
                    )}
                  </div>
                </div>

                {booking.status === "pending" && (
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/booking/${booking.id}/reschedule`}>
                        Reschedule
                      </Link>
                    </Button>

                    {/* UI-only until you add a cancel endpoint + client action */}
                    <Button size="sm" variant="outline">
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState
            icon={Calendar}
            title="No bookings yet"
            description="Start by booking your first appointment to get started."
            action={{
              label: "Browse Services",
              href: "/services", // ✅ server-safe (no window)
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
