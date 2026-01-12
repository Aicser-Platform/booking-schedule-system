import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Calendar, User, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminBookingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services(name, price, duration_minutes),
      user_profiles!bookings_staff_id_fkey(full_name),
      customers(full_name, email, phone)
    `,
    )
    .order("start_time_utc", { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold">All Bookings</h1>
          <Button asChild variant="outline">
            <Link href="/admin/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <div className="container py-8">
        <div className="space-y-4">
          {bookings && bookings.length > 0 ? (
            bookings.map((booking: any) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{booking.services?.name}</CardTitle>
                      <CardDescription>
                        {format(new Date(booking.start_time_utc), "MMMM d, yyyy 'at' h:mm a")}
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
                    <div className="flex items-start gap-2">
                      <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="font-medium">Customer</p>
                        <p className="text-muted-foreground">{booking.customers?.full_name}</p>
                        <p className="text-muted-foreground">{booking.customers?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="font-medium">Staff</p>
                        <p className="text-muted-foreground">{booking.user_profiles?.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="font-medium">Details</p>
                        <p className="text-muted-foreground">{booking.services?.duration_minutes} min</p>
                        <p className="font-semibold">${booking.services?.price}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">No bookings found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
