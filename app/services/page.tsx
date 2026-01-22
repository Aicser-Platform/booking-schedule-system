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
    <div className="min-h-screen bg-background">
      <div className="container py-10 sm:py-16">
        <div className="mb-12 grid gap-8 rounded-2xl border border-border bg-card p-8 shadow-lg md:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Services Catalog
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Discover your next appointment
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Browse curated services, filter by availability, and book in
              minutes.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full border border-border bg-background px-4 py-1.5 font-medium text-foreground shadow-sm">
                {services.length} services
              </span>
              <span className="rounded-full border border-border bg-background px-4 py-1.5 font-medium text-foreground shadow-sm">
                {categories.length} categories
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4 rounded-xl border border-border bg-muted/50 p-6">
            <p className="text-sm font-semibold text-foreground">Highlights</p>
            <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <span>• Transparent pricing with deposit badges</span>
              <span>• Filter by duration, price, and category</span>
              <span>• Book only services with eligible staff</span>
            </div>
            <Button asChild className="mt-2 w-fit">
              <Link href="#services">Explore services</Link>
            </Button>
          </div>
        </div>

        <form className="mb-12 rounded-xl border border-border bg-card p-6 shadow-md">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label className="text-sm font-medium text-foreground">
                Search
              </label>
              <input
                name="search"
                defaultValue={filters.search ?? ""}
                placeholder="Search services"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Category
              </label>
              <select
                name="category"
                defaultValue={filters.category ?? ""}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  name="require_staff"
                  type="checkbox"
                  defaultChecked={filters.require_staff === "true"}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/20"
                />
                Bookable only
              </label>
            </div>
          </div>
          <details className="mt-5 group">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              Advanced Filters
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Min Price
                </label>
                <input
                  name="min_price"
                  type="number"
                  step="0.01"
                  defaultValue={filters.min_price ?? ""}
                  placeholder="$0.00"
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Max Price
                </label>
                <input
                  name="max_price"
                  type="number"
                  step="0.01"
                  defaultValue={filters.max_price ?? ""}
                  placeholder="$999.99"
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Min Duration
                </label>
                <input
                  name="min_duration"
                  type="number"
                  defaultValue={filters.min_duration ?? ""}
                  placeholder="0 min"
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Max Duration
                </label>
                <input
                  name="max_duration"
                  type="number"
                  defaultValue={filters.max_duration ?? ""}
                  placeholder="480 min"
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </details>
          <div className="mt-5 flex justify-end">
            <Button type="submit" size="lg" className="px-8">
              Apply Filters
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
                className="group flex h-full flex-col overflow-hidden border border-border bg-card shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-primary/50"
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
                        className="h-48 w-full"
                        imageClassName="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="h-48 w-full bg-gradient-to-br from-muted to-muted/50" />
                    );
                  })()}
                  {service.category && (
                    <span className="absolute left-4 top-4 rounded-full border border-border bg-background/95 px-3 py-1 text-xs font-semibold text-foreground shadow-md backdrop-blur-sm">
                      {service.category}
                    </span>
                  )}
                </div>
                <CardHeader className="space-y-3 pb-4">
                  <CardTitle className="text-xl font-bold leading-tight">
                    {service.public_name || service.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                    {service.description}
                  </CardDescription>
                  {service.tags && service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {service.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="flex-1 pt-2">
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

                <CardFooter className="mt-auto pt-4">
                  <Button asChild className="w-full" size="lg">
                    <Link href={`/book/${service.id}`}>Book Now</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-20 text-center">
            <p className="text-lg font-semibold text-foreground">
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
