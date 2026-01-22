import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
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
      <div className="mb-8 flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Services
          </h1>
          <p className="text-gray-500">Manage all service offerings</p>
        </div>

        <Button
          asChild
          className="rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <Link href="/admin/services/new">
            <Plus className="mr-2 size-4" />
            Add Service
          </Link>
        </Button>
      </div>

      {services.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const images = service.image_urls?.length
              ? service.image_urls
              : service.image_url
                ? [service.image_url]
                : [];
            const firstImage = images[0];

            return (
              <div
                key={service.id}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* Image Section */}
                {firstImage ? (
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={firstImage}
                      alt={service.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="relative aspect-[4/3] bg-gray-100" />
                )}

                {/* Content Section */}
                <div className="p-5 space-y-4">
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                        {service.name}
                      </h3>
                      {service.is_active && (
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                    {service.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </div>

                  {/* Metadata Grid - 2 columns, clean spacing */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Duration</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {service.duration_minutes} min
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Price</p>
                      <p className="text-sm font-semibold text-gray-900">
                        ${service.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Deposit</p>
                      <p className="text-sm font-semibold text-gray-900">
                        ${service.deposit_amount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Buffer</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {service.buffer_minutes} min
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Capacity</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {service.max_capacity}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-lg border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <Link href={`/admin/services/${service.id}/edit`}>
                        <Edit className="mr-2 size-4" />
                        Edit
                      </Link>
                    </Button>
                    <DeleteServiceButton serviceId={service.id} />
                  </div>
                </div>
              </div>
            );
          })}
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
