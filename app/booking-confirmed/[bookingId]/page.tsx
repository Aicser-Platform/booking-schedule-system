import { notFound } from "next/navigation";
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

async function getBookingConfirmed(
  bookingId: string
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

  const booking = await getBookingConfirmed(bookingId);
  if (!booking || !booking.services) notFound();

  const staffName = booking.staff?.full_name || "Staff Member";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-12">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-3xl">Booking Confirmed!</CardTitle>
              <p className="text-muted-foreground">
                Your appointment has been successfully booked
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
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
                        "EEEE, MMMM d, yyyy"
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

              <div className="rounded-lg bg-blue-50 p-4 text-sm">
                <p className="font-medium text-blue-900">What's Next?</p>
                <ul className="mt-2 space-y-1 text-blue-800">
                  <li>• You'll receive a confirmation email shortly</li>
                  <li>• We'll send you a reminder before your appointment</li>
                  <li>• You can reschedule or cancel from your dashboard</li>
                </ul>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="flex-1">
                  <Link href="/dashboard">View My Bookings</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 bg-transparent"
                >
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
