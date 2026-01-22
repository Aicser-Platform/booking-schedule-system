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
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  // Check if user is logged in
  const me = await getMe();
  if (!me) redirect(`/auth/login?redirect=/book/${serviceId}`);

  // Get service details
  const service = await getService(serviceId);
  if (!service) notFound();

  // Get staff assigned to this service
  const staff = await getServiceStaff(serviceId);

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
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
                    className="h-80 w-full"
                    imageClassName="h-80 w-full object-cover"
                  />
                ) : (
                  <div className="h-80 w-full bg-gradient-to-br from-muted to-muted/50" />
                );
              })()}
              <div className="p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Service Details
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {service.public_name || service.name}
                </h1>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5 text-sm">
                  {service.category && (
                    <span className="rounded-full border border-border bg-background px-4 py-1.5 font-medium text-foreground shadow-sm">
                      {service.category}
                    </span>
                  )}
                  <span className="rounded-full border border-border bg-background px-4 py-1.5 font-medium text-foreground shadow-sm">
                    {service.duration_minutes} mins
                  </span>
                  <span className="rounded-full border border-border bg-background px-4 py-1.5 font-medium text-foreground shadow-sm">
                    ${service.price}
                  </span>
                  {service.deposit_amount > 0 && (
                    <span className="rounded-full border border-border bg-background px-4 py-1.5 font-medium text-foreground shadow-sm">
                      ${service.deposit_amount} deposit
                    </span>
                  )}
                </div>
                {service.tags && service.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
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
                <div className="rounded-xl border border-border bg-card p-5 shadow-md">
                  <h2 className="text-sm font-semibold text-foreground">
                    Inclusions
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.inclusions}
                  </p>
                </div>
              )}
              {service.prep_notes && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-md">
                  <h2 className="text-sm font-semibold text-foreground">
                    Prep Notes
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.prep_notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-8">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Book now
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
