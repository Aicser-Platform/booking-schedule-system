import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import type { CSSProperties } from "react";
import { Playfair_Display } from "next/font/google";
import { BookingForm } from "@/components/booking/booking-form";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { cn } from "@/lib/utils";

const displayFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

type MeUser = {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  timezone?: string | null;
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
  avatar_url?: string | null;
  price_override?: number | string | null;
  deposit_override?: number | string | null;
  duration_override?: number | string | null;
  buffer_override?: number | string | null;
  capacity_override?: number | string | null;
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

const themeStyle: CSSProperties = {
  "--booking-bg": "oklch(0.08 0.02 240)",
  "--booking-accent": "oklch(0.5 0.22 200)",
};

export default async function BookServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ serviceId: string }> | { serviceId: string };
  searchParams?: Promise<{ source?: string }> | { source?: string };
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams
    ? await searchParams
    : undefined;
  const { serviceId } = resolvedParams;
  const source = resolvedSearchParams?.source === "social" ? "social" : "web";

  const me = await getMe();
  if (!me) redirect(`/auth/login?redirect=/book/${serviceId}`);

  const service = await getService(serviceId);
  if (!service) notFound();

  const staff = await getServiceStaff(serviceId);

  const images = service.image_urls?.length
    ? service.image_urls
    : service.image_url
      ? [service.image_url]
      : [];

  const inclusionItems = service.inclusions
    ? service.inclusions
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return (
    <div
      className="min-h-screen bg-[var(--booking-bg)] text-slate-100"
      style={themeStyle}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)]">
          <div className="space-y-8 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-6 scrollbar-thin">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
              {images.length > 0 ? (
                <ImageCarousel
                  images={images}
                  alt={service.name}
                  className="h-80 w-full"
                  imageClassName="h-80 w-full object-cover"
                />
              ) : (
                <div className="h-80 w-full bg-white/5" />
              )}
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Service Details
              </p>
              <h1
                className={cn(
                  "text-3xl font-semibold tracking-tight text-white sm:text-4xl",
                  displayFont.className,
                )}
              >
                {service.public_name || service.name}
              </h1>
              {service.description ? (
                <p className="text-base leading-relaxed text-slate-300">
                  {service.description}
                </p>
              ) : null}
            </div>

              <div className="flex flex-wrap gap-3 text-xs">
              {service.category ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                  {service.category}
                </span>
              ) : null}
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                {service.duration_minutes} mins
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                ${service.price}
              </span>
              {service.deposit_amount > 0 ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                  ${service.deposit_amount} deposit
                </span>
              ) : null}
              {service.max_capacity > 1 ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                  Group booking up to {service.max_capacity}
                </span>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {inclusionItems.length > 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <h2 className="text-sm font-semibold text-white">
                    What&apos;s Included
                  </h2>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {inclusionItems.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--booking-accent)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {service.prep_notes ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <h2 className="text-sm font-semibold text-white">Prep Notes</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {service.prep_notes}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="lg:sticky lg:top-8">
            <div className="rounded-3xl border border-white/10 bg-black/40 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Book your day
                </p>
                <h2 className="text-lg font-semibold text-white">
                  Secure your preferred time
                </h2>
                <p className="text-sm text-slate-400">
                  Select staff, date, and time. We&apos;ll confirm instantly and
                  handle payment at the appointment.
                </p>
              </div>
              <div className="mt-6">
                <BookingForm
                  service={service}
                  staff={staff}
                  customer={me}
                  bookingSource={source}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
