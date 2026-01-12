import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { PaymentForm } from "@/components/payment/payment-form"

export default async function PaymentPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get booking details
  const { data: booking } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services(name, price, deposit_amount),
      user_profiles!bookings_staff_id_fkey(full_name)
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
          <PaymentForm booking={booking} />
        </div>
      </div>
    </div>
  )
}
