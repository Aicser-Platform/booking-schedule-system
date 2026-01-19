import { headers } from "next/headers";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { Clock, DollarSign } from "lucide-react";

type ServiceRow = {
  id: string;
  name: string;
  public_name?: string | null;
  category?: string | null;
  tags?: string[] | null;
  description?: string | null;
  image_url?: string | null;
  image_urls?: string[] | null;
  duration_minutes: number;
  price: number;
  deposit_amount: number;
  is_active: boolean;
};

type ServicesFilters = {
  search?: string;
  category?: string;
  min_price?: string;
  max_price?: string;
  min_duration?: string;
  max_duration?: string;
  require_staff?: string;
};

async function getActiveServices(
  filters: ServicesFilters,
): Promise<ServiceRow[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  const query = new URLSearchParams();
  if (filters.search) query.set("search", filters.search);
  if (filters.category) query.set("category", filters.category);
  if (filters.min_price) query.set("min_price", filters.min_price);
  if (filters.max_price) query.set("max_price", filters.max_price);
  if (filters.min_duration) query.set("min_duration", filters.min_duration);
  if (filters.max_duration) query.set("max_duration", filters.max_duration);
  if (filters.require_staff) query.set("require_staff", "true");

  // Backend endpoint you should create:
  // GET /api/services (or /api/services/active)
  // Returns active services ordered by name
  try {
    const res = await fetch(`${apiUrl}/api/services?${query.toString()}`, {
      method: "GET",
      headers: { Cookie: cookie },
      cache: "no-store",
    });

    if (!res.ok) return [];
    const data = (await res.json()) as ServiceRow[];

    // If your backend returns all services, keep only active ones here.
    return data
      .filter((s) => s.is_active)
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams?: ServicesFilters;
}) {
  const filters = searchParams ?? {};
  const services = await getActiveServices(filters);
  const categories = Array.from(
    new Set(services.map((service) => service.category).filter(Boolean)),
  ) as string[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <div className="container py-12">
        <div className="mb-10 grid gap-6 rounded-3xl border border-white/60 bg-white/70 p-8 shadow-sm backdrop-blur md:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Services Catalog
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Discover your next appointment
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Browse curated services, filter by availability, and book in
              minutes.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                {services.length} services
              </span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                {categories.length} categories
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-500/10 to-sky-500/10 p-6">
            <p className="text-sm font-semibold text-indigo-600">Highlights</p>
            <div className="flex flex-col gap-2 text-sm text-slate-600">
              <span>• Transparent pricing with deposit badges</span>
              <span>• Filter by duration, price, and category</span>
              <span>• Book only services with eligible staff</span>
            </div>
            <Button asChild className="mt-2 w-fit">
              <Link href="#services">Explore services</Link>
            </Button>
          </div>
        </div>

        <form className="mb-10 grid gap-4 rounded-2xl border border-border bg-white/80 p-5 shadow-sm backdrop-blur md:grid-cols-7">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Search</label>
            <input
              name="search"
              defaultValue={filters.search ?? ""}
              placeholder="Search services"
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              name="category"
              defaultValue={filters.category ?? ""}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            >
              <option value="">All</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Min Price</label>
            <input
              name="min_price"
              type="number"
              step="0.01"
              defaultValue={filters.min_price ?? ""}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Max Price</label>
            <input
              name="max_price"
              type="number"
              step="0.01"
              defaultValue={filters.max_price ?? ""}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Min Duration</label>
            <input
              name="min_duration"
              type="number"
              defaultValue={filters.min_duration ?? ""}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Max Duration</label>
            <input
              name="max_duration"
              type="number"
              defaultValue={filters.max_duration ?? ""}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            />
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                name="require_staff"
                type="checkbox"
                defaultChecked={filters.require_staff === "true"}
              />
              Bookable only
            </label>
            <Button type="submit" className="ml-auto">
              Apply
            </Button>
          </div>
        </form>

        {services.length > 0 ? (
          <div
            id="services"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {services.map((service) => (
              <Card
                key={service.id}
                className="group flex h-full flex-col overflow-hidden border border-white/60 bg-white/80 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative">
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
                        className="h-44 w-full"
                        imageClassName="h-44 w-full object-cover"
                      />
                    ) : (
                      <div className="h-44 w-full bg-gradient-to-br from-indigo-100 to-sky-100" />
                    );
                  })()}
                  {service.category && (
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600 shadow">
                      {service.category}
                    </span>
                  )}
                </div>
                <CardHeader className="space-y-2">
                  <CardTitle className="text-xl">
                    {service.public_name || service.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {service.description}
                  </CardDescription>
                  {service.tags && service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {service.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{service.duration_minutes} minutes</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-2xl font-bold text-slate-900">
                          ${service.price}
                        </span>
                      </div>
                      {service.deposit_amount > 0 && (
                        <Badge variant="secondary" className="w-fit">
                          ${service.deposit_amount} deposit
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="mt-auto">
                  <Button asChild className="w-full">
                    <Link href={`/book/${service.id}`}>Book Now</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white/70 py-16 text-center">
            <p className="text-lg font-medium text-slate-800">
              No services available at the moment.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting the filters or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
