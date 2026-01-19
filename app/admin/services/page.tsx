import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { Plus, Edit } from "lucide-react";
import DeleteServiceButton from "./DeleteServiceButton";

type MeUser = {
  id: string;
  email: string;
  role: "customer" | "staff" | "admin" | "superadmin";
};

type ServiceRow = {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  image_urls?: string[] | null;
  is_active: boolean;
  duration_minutes: number;
  price: number;
  deposit_amount: number;
  buffer_minutes: number;
  max_capacity: number;
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

async function getServices(): Promise<ServiceRow[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cookie = (await headers()).get("cookie") ?? "";

  // Backend endpoint you should create:
  // GET /api/admin/services
  try {
    const res = await fetch(`${apiUrl}/api/admin/services`, {
      method: "GET",
      headers: { Cookie: cookie },
      cache: "no-store",
    });

    if (!res.ok) return [];
    return (await res.json()) as ServiceRow[];
  } catch {
    return [];
  }
}

export default async function AdminServicesPage() {
  const me = await getMe();
  if (!me) redirect("/auth/login");
  if (me.role !== "admin" && me.role !== "superadmin") redirect("/dashboard");

  const services = await getServices();

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Services</h2>
          <p className="text-muted-foreground">Manage all service offerings</p>
        </div>

        <Button asChild className="glow-primary-subtle">
          <Link href="/admin/services/new">
            <Plus className="mr-2 size-4" />
            Add Service
          </Link>
        </Button>
      </div>

      {services.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="glass-card">
              {(() => {
                const images = service.image_urls?.length
                  ? service.image_urls
                  : service.image_url
                    ? [service.image_url]
                    : [];

                return images.length > 0 ? (
                  <div className="overflow-hidden rounded-t-xl">
                    <ImageCarousel
                      images={images}
                      alt={service.name}
                      className="h-36 w-full"
                      imageClassName="h-36 w-full object-cover"
                    />
                  </div>
                ) : null;
              })()}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{service.name}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {service.description}
                    </CardDescription>
                  </div>
                  <Badge variant={service.is_active ? "default" : "secondary"}>
                    {service.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {service.duration_minutes} min
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-medium">${service.price}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Deposit</p>
                    <p className="font-medium">${service.deposit_amount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Buffer</p>
                    <p className="font-medium">{service.buffer_minutes} min</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Capacity</p>
                    <p className="font-medium">{service.max_capacity}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    <Link href={`/admin/services/${service.id}/edit`}>
                      <Edit className="mr-2 size-4" />
                      Edit
                    </Link>
                  </Button>

                  {/* UI-only until you add a delete endpoint + client action */}
                  <DeleteServiceButton serviceId={service.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Plus}
          title="No services yet"
          description="Create your first service to start accepting bookings."
          action={{
            label: "Create First Service",
            href: "/admin/services/new", // ✅ server-safe (no window usage)
          }}
        />
      )}
    </DashboardLayout>
  );
}
