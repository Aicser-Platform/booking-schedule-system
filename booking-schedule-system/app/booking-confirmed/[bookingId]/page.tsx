import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, Calendar, Clock, User } from "lucide-react"
import { format } from "date-fns"

export default async function BookingConfirmedPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params
  const supabase = await createClient()

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services(name, price, duration_minutes),
      user_profiles!bookings_staff_id_fkey(full_name, phone)
    `,
    )
    .eq("id", bookingId)
    .single()

  if (!booking) {
    notFound()
  }

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
              <p className="text-muted-foreground">Your appointment has been successfully booked</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{booking.services.name}</p>
                    <p className="text-sm text-muted-foreground">with {booking.user_profiles.full_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{format(new Date(booking.start_time_utc), "EEEE, MMMM d, yyyy")}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.start_time_utc), "h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{booking.services.duration_minutes} minutes</p>
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
                <Button asChild variant="outline" className="flex-1 bg-transparent">
                  <Link href="/services">Book Another</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
