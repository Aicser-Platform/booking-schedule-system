import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { BookingForm } from "@/components/booking/booking-form";
import { ImageCarousel } from "@/components/ui/image-carousel";

type MeUser = {
  id: string;
  email: string;
  role: "customer" | "staff" | "admin" | "superadmin";
};

type ServiceRow = {
  id: string;
  name: string;
  public_name?: string | null;
  internal_name?: string | null;
  category?: string | null;
  tags?: string[] | null;
  description?: string | null;
  inclusions?: string | null;
  prep_notes?: string | null;
  image_url?: string | null;
  image_urls?: string[] | null;
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

async function getService(serviceId: string): Promise<ServiceRow | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <div className="container py-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="mb-8 overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-sm">
              {(() => {
                const images = service.image_urls?.length
                  ? service.image_urls
                  : service.image_url
                    ? [service.image_url]
                    : [];

                return images.length > 0 ? (
                  <ImageCarousel
                    images={images}
                    alt={service.name}
                    className="h-72 w-full"
                    imageClassName="h-72 w-full object-cover"
                  />
                ) : (
                  <div className="h-72 w-full bg-gradient-to-br from-indigo-100 to-sky-100" />
                );
              })()}
              <div className="p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">
                  Service Details
                </p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                  {service.public_name || service.name}
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                  {service.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {service.category && (
                    <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                      {service.category}
                    </span>
                  )}
                  <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                    {service.duration_minutes} mins
                  </span>
                  <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                    ${service.price}
                  </span>
                  {service.deposit_amount > 0 && (
                    <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                      ${service.deposit_amount} deposit
                    </span>
                  )}
                </div>
                {service.tags && service.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {service.inclusions && (
                <div className="rounded-2xl border border-border bg-white/70 p-5 shadow-sm">
                  <h2 className="text-sm font-semibold">Inclusions</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {service.inclusions}
                  </p>
                </div>
              )}
              {service.prep_notes && (
                <div className="rounded-2xl border border-border bg-white/70 p-5 shadow-sm">
                  <h2 className="text-sm font-semibold">Prep Notes</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {service.prep_notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-8">
            <div className="rounded-3xl border border-border bg-white/80 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">
                Book now
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Select staff and your preferred time slot.
              </p>
              <div className="mt-6">
                <BookingForm service={service} staff={staff} userId={me.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
