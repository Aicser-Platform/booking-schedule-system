import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users, Zap, Shield, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">AppointBook</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center gap-8 py-24 text-center lg:py-32">
        <div className="flex max-w-3xl flex-col gap-4">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Streamline Your Appointment Scheduling
          </h1>
          <p className="text-pretty text-lg text-muted-foreground sm:text-xl">
            Modern booking platform for service-based businesses. Manage appointments, staff, and customers all in one
            place.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="text-base">
            <Link href="/auth/signup">Start Free Trial</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-base bg-transparent">
            <Link href="/services">Browse Services</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything You Need</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features to manage your appointments efficiently
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Clock className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Time-Slot Booking</CardTitle>
              <CardDescription>
                Real-time availability with smart scheduling to prevent double-bookings and optimize time slots.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Staff Management</CardTitle>
              <CardDescription>
                Manage multiple staff members, assign services, and control individual availability schedules.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Instant Notifications</CardTitle>
              <CardDescription>
                Automated email and SMS notifications for confirmations, reminders, and booking changes.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Secure Payments</CardTitle>
              <CardDescription>
                Integrated payment processing with ABA Payway for deposits and full payments.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>
                Track bookings, revenue, staff performance, and customer feedback with detailed analytics.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Calendar Sync</CardTitle>
              <CardDescription>
                Integrated calendar views with timezone support for customers and staff worldwide.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50">
        <div className="container flex flex-col items-center gap-8 py-24 text-center">
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground">
              Join hundreds of businesses using our platform to manage their appointments efficiently.
            </p>
          </div>
          <Button asChild size="lg" className="text-base">
            <Link href="/auth/signup">Create Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-semibold">AppointBook</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 AppointBook. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
