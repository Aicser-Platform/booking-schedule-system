import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { BookingForm } from "@/components/booking/booking-form";

type MeUser = {
  id: string;
  email: string;
  role: "customer" | "staff" | "admin";
};

type ServiceRow = {
  id: string;
  name: string;
  description?: string | null;
  duration_minutes: number;
  price: number;
  deposit_amount: number;
  max_capacity: number;
  is_active: boolean;
};

type StaffOption = {
  id: string;
  name: string;
};

async function getMe(): Promise<MeUser | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  const res = await fetch(`${apiUrl}/api/auth/me`, {
    method: "GET",
    headers: { Cookie: cookie },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return (await res.json()) as MeUser;
}

async function getService(serviceId: string): Promise<ServiceRow | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  // Backend endpoint you should create:
  // GET /api/services/:serviceId
  try {
    const res = await fetch(`${apiUrl}/api/services/${serviceId}`, {
      method: "GET",
      headers: { Cookie: cookie },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()) as ServiceRow;
  } catch {
    return null;
  }
}

async function getServiceStaff(serviceId: string): Promise<StaffOption[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  // Backend endpoint you should create:
  // GET /api/services/:serviceId/staff
  try {
    const res = await fetch(`${apiUrl}/api/services/${serviceId}/staff`, {
      method: "GET",
      headers: { Cookie: cookie },
      cache: "no-store",
    });

    if (!res.ok) return [];
    return (await res.json()) as StaffOption[];
  } catch {
    return [];
  }
}

export default async function BookServicePage({
  params,
}: {
  params: { serviceId: string };
}) {
  const { serviceId } = params;

  // Check if user is logged in
  const me = await getMe();
  if (!me) redirect(`/auth/login?redirect=/book/${serviceId}`);

  // Get service details
  const service = await getService(serviceId);
  if (!service) notFound();

  // Get staff assigned to this service
  const staff = await getServiceStaff(serviceId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">
              {service.name}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {service.description}
            </p>
          </div>

          <BookingForm service={service} staff={staff} userId={me.id} />
        </div>
      </div>
    </div>
  );
}
