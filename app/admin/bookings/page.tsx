import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Calendar, User, Clock } from "lucide-react";

type MeUser = {
  id: string;
  email: string;
  role: "customer" | "staff" | "admin" | "superadmin";
};

type Booking = {
  id: string;
  start_time_utc: string;
  status: string;
  payment_status: string;
  service: {
    name: string;
    price: number;
    duration_minutes: number;
  };
  staff?: {
    full_name?: string | null;
  };
  customer?: {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
};

async function getMe(): Promise<MeUser | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  const res = await fetch(`${apiUrl}/api/auth/me`, {
    headers: { Cookie: cookie },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

async function getBookings(): Promise<Booking[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  const res = await fetch(`${apiUrl}/api/admin/bookings`, {
    headers: { Cookie: cookie },
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function AdminBookingsPage() {
  // ── Auth guard ───────────────────────────────
  const me = await getMe();
  if (!me) redirect("/auth/login");
  if (me.role !== "admin" && me.role !== "superadmin") redirect("/dashboard");

  // ── Data ─────────────────────────────────────
  const bookings = await getBookings();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold">All Bookings</h1>
          <Button asChild variant="outline">
            <Link href="/admin/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <div className="container motion-page py-8">
        <div className="space-y-4">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <Card key={booking.id} className="shadow-[var(--shadow-card)]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {booking.service?.name}
                      </CardTitle>
                      <CardDescription>
                        {format(
                          new Date(booking.start_time_utc),
                          "MMMM d, yyyy 'at' h:mm a"
                        )}
                      </CardDescription>
                    </div>

                    <div className="flex gap-2">
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
                      <Badge variant="outline">{booking.payment_status}</Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {/* Customer */}
                    <div className="flex items-start gap-2">
                      <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="font-medium">Customer</p>
                        <p className="text-muted-foreground">
                          {booking.customer?.full_name}
                        </p>
                        <p className="text-muted-foreground">
                          {booking.customer?.email}
                        </p>
                      </div>
                    </div>

                    {/* Staff */}
                    <div className="flex items-start gap-2">
                      <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="font-medium">Staff</p>
                        <p className="text-muted-foreground">
                          {booking.staff?.full_name || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex items-start gap-2">
                      <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="font-medium">Details</p>
                        <p className="text-muted-foreground">
                          {booking.service?.duration_minutes} min
                        </p>
                        <p className="font-semibold">
                          ${booking.service?.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="shadow-[var(--shadow-card)]">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">No bookings found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
