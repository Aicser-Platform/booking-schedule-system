"use client";

import {
  BookingCard,
  BookingCardCompact,
} from "@/components/booking/BookingCard";

/**
 * Example usage of the premium BookingCard components
 * This demonstrates all booking statuses and card variants
 */
export default function BookingExamplesPage() {
  const exampleBookings = [
    {
      id: "1",
      serviceName: "Premium Hair Styling",
      serviceImage: "/uploads/3f186856-d232-4ce0-b9bd-f41f262e0fd0.avif",
      date: "Jan 24, 2026",
      time: "10:30 AM",
      price: 75,
      status: "confirmed" as const,
      location: "Downtown Studio",
      providerName: "Sarah Johnson",
    },
    {
      id: "2",
      serviceName: "Deep Tissue Massage",
      serviceImage: "/uploads/6222c81e-3c2a-4a32-97c4-b0e455a3295a.avif",
      date: "Jan 25, 2026",
      time: "2:00 PM",
      price: 120,
      status: "pending" as const,
      location: "Wellness Center",
      providerName: "Michael Chen",
    },
    {
      id: "3",
      serviceName: "Facial Treatment",
      date: "Jan 22, 2026",
      time: "11:00 AM",
      price: 90,
      status: "completed" as const,
      location: "Beauty Spa",
      providerName: "Emily Roberts",
    },
    {
      id: "4",
      serviceName: "Personal Training",
      date: "Jan 20, 2026",
      time: "6:00 AM",
      price: 65,
      status: "cancelled" as const,
      location: "Fitness Studio",
      providerName: "David Lee",
    },
  ];

  const handleViewDetails = (id: string) => {
    console.log("View booking:", id);
  };

  const handleBook = (id: string) => {
    console.log("Confirm booking:", id);
  };

  const handleEdit = (id: string) => {
    console.log("Edit booking:", id);
  };

  const handleCancel = (id: string) => {
    console.log("Cancel booking:", id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <h1 className="text-3xl font-semibold">Your Bookings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your upcoming and past appointments
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Full Booking Cards */}
        <section>
          <h2 className="mb-6 text-xl font-semibold">Upcoming & Recent</h2>
          <div className="space-y-6">
            {exampleBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                {...booking}
                onViewDetails={() => handleViewDetails(booking.id)}
                onBook={() => handleBook(booking.id)}
                onEdit={() => handleEdit(booking.id)}
                onCancel={() => handleCancel(booking.id)}
              />
            ))}
          </div>
        </section>

        {/* Compact Cards */}
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-semibold">Quick View (Compact)</h2>
          <div className="space-y-3">
            {exampleBookings.map((booking) => (
              <BookingCardCompact
                key={`compact-${booking.id}`}
                serviceName={booking.serviceName}
                date={booking.date}
                time={booking.time}
                price={booking.price}
                status={booking.status}
                onViewDetails={() => handleViewDetails(booking.id)}
              />
            ))}
          </div>
        </section>

        {/* Status Legend */}
        <section className="mt-16 rounded-3xl border border-border/60 bg-card/80 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-lg font-semibold">Booking Status Guide</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <span className="inline-block rounded-full border border-amber-200/60 bg-amber-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-amber-700">
                Pending
              </span>
              <p className="text-sm text-muted-foreground">
                Awaiting confirmation
              </p>
            </div>
            <div className="space-y-2">
              <span className="inline-block rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-emerald-700">
                Confirmed
              </span>
              <p className="text-sm text-muted-foreground">
                Booking is confirmed
              </p>
            </div>
            <div className="space-y-2">
              <span className="inline-block rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-blue-700">
                Completed
              </span>
              <p className="text-sm text-muted-foreground">Service completed</p>
            </div>
            <div className="space-y-2">
              <span className="inline-block rounded-full border border-gray-200/60 bg-gray-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-gray-600">
                Cancelled
              </span>
              <p className="text-sm text-muted-foreground">Booking cancelled</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
