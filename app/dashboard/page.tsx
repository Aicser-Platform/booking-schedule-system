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
  role: "customer" | "staff" | "admin" | "superadmin";
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
  if (me.role === "admin" || me.role === "superadmin")
    redirect("/admin/dashboard");
  if (me.role === "staff") redirect("/staff/dashboard");

  const bookings = await getMyBookings(me.id);

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            My Bookings
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage your appointments
          </p>
        </div>

        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/services">Book New Appointment</Link>
        </Button>
      </div>

      <div className="grid gap-5">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <Card
              key={booking.id}
              className="border border-border bg-card shadow-md transition-shadow hover:shadow-lg"
            >
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold">
                      {booking.service_name}
                    </CardTitle>
                    <CardDescription className="mt-1.5 text-sm">
                      {format(
                        new Date(booking.start_time_utc),
                        "MMMM d, yyyy 'at' h:mm a",
                      )}
                    </CardDescription>
                  </div>

                  <Badge
                    className="shrink-0"
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

              <CardContent className="pt-2">
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">
                      {booking.staff_name || "Staff Member"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{booking.duration_minutes} minutes</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold text-foreground">
                      ${booking.price}
                    </span>
                    {booking.payment_status && (
                      <Badge variant="outline" className="ml-1 text-xs">
                        {booking.payment_status}
                      </Badge>
                    )}
                  </div>
                </div>

                {booking.status === "pending" && (
                  <div className="mt-5 flex gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="flex-1 sm:flex-none"
                    >
                      <Link href={`/booking/${booking.id}/reschedule`}>
                        Reschedule
                      </Link>
                    </Button>

                    {/* UI-only until you add a cancel endpoint + client action */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-none"
                    >
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
