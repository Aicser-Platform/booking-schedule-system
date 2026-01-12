import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { BookingForm } from "@/components/booking/booking-form"

export default async function BookServicePage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params
  const supabase = await createClient()

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirect=/book/${serviceId}`)
  }

  // Get service details
  const { data: service } = await supabase.from("services").select("*").eq("id", serviceId).single()

  if (!service) {
    notFound()
  }

  // Get staff assigned to this service
  const { data: staffAssignments } = await supabase
    .from("staff_services")
    .select("staff_id, user_profiles!staff_services_staff_id_fkey(id, full_name)")
    .eq("service_id", serviceId)

  const staff = staffAssignments?.map((a: any) => ({
    id: a.staff_id,
    name: a.user_profiles.full_name || "Staff Member",
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">{service.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{service.description}</p>
          </div>

          <BookingForm service={service} staff={staff || []} userId={user.id} />
        </div>
      </div>
    </div>
  )
}
