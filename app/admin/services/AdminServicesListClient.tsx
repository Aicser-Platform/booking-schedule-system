"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminServiceCard from "./AdminServiceCard";

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

type AdminServicesListClientProps = {
  services: ServiceRow[];
};

export default function AdminServicesListClient({
  services,
}: AdminServicesListClientProps) {
  const [items, setItems] = useState<ServiceRow[]>(services);
  const hasItems = items.length > 0;

  const handleDeleted = (serviceId: string) => {
    setItems((prev) =>
      prev.filter((service) => String(service.id) !== String(serviceId)),
    );
  };

  const emptyState = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
          <Plus className="size-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No services yet</h3>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          Create your first service to start accepting bookings.
        </p>
        <Button asChild>
          <Link href="/admin/services/new">Create First Service</Link>
        </Button>
      </div>
    ),
    [],
  );

  if (!hasItems) {
    return emptyState;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((service) => (
        <AdminServiceCard
          key={service.id}
          service={service}
          onDeleted={handleDeleted}
        />
      ))}
    </div>
  );
}
