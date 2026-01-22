import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";

type BookingConfirmedRow = {
  id: string;
  start_time_utc: string;
  services: {
    name: string;
    price: number;
    duration_minutes: number;
  } | null;
  staff: {
    full_name?: string | null;
    phone?: string | null;
  } | null;
};

type MeUser = {
  id: string;
  email: string;
  role: "customer" | "staff" | "admin" | "superadmin";
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

async function getBookingConfirmed(
  bookingId: string,
): Promise<BookingConfirmedRow | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  // Backend endpoint you should create:
  // GET /api/bookings/:bookingId/confirmed
  // Returns booking + service + staff (public-safe fields)
  try {
    const res = await fetch(`${apiUrl}/api/bookings/${bookingId}/confirmed`, {
      method: "GET",
      headers: { Cookie: cookie },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()) as BookingConfirmedRow;
  } catch {
    return null;
  }
}

export default async function BookingConfirmedPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const { bookingId } = params;

  const me = await getMe();
  if (!me) redirect("/auth/login");

  const booking = await getBookingConfirmed(bookingId);
  if (!booking || !booking.services) notFound();

  const staffName = booking.staff?.full_name || "Staff Member";

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="mx-auto max-w-2xl">
          <Card className="border border-border bg-card shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 border-2 border-green-200">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold mb-2">
                Booking Confirmed!
              </CardTitle>
              <p className="text-base text-muted-foreground">
                Your appointment has been successfully booked
              </p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-5">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{booking.services.name}</p>
                    <p className="text-sm text-muted-foreground">
                      with {staffName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {format(
                        new Date(booking.start_time_utc),
                        "EEEE, MMMM d, yyyy",
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.start_time_utc), "h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {booking.services.duration_minutes} minutes
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
                <p className="font-semibold text-foreground mb-2">
                  What's Next?
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>You'll receive a confirmation email shortly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>
                      We'll send you a reminder before your appointment
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>
                      You can reschedule or cancel from your dashboard
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row pt-2">
                <Button asChild size="lg" className="flex-1">
                  <Link href="/dashboard">View My Bookings</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="flex-1">
                  <Link href="/services">Book Another</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
