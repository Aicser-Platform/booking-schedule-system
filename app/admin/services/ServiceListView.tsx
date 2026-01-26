"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";
import DeleteServiceButton from "./DeleteServiceButton";

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

type ServiceListViewProps = {
  services: ServiceRow[];
};

export function ServiceListView({ services }: ServiceListViewProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-900">
          <div className="col-span-4">Service</div>
          <div className="col-span-2">Duration</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Capacity</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
      </div>

      {/* Services List */}
      <div className="divide-y divide-gray-200">
        {services.map((service, index) => {
          const images = service.image_urls?.filter(Boolean) || (service.image_url ? [service.image_url] : []);
          const firstImage = images[0];

          return (
            <div
              key={service.id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Service Info */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={service.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                        <Eye className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-sm text-gray-500 truncate">
                        {service.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Duration */}
                <div className="col-span-2">
                  <span className="text-sm font-medium text-gray-900">
                    {service.duration_minutes} mins
                  </span>
                </div>

                {/* Price */}
                <div className="col-span-2">
                  <span className="text-sm font-semibold text-gray-900">
                    ${service.price}
                  </span>
                  {service.deposit_amount > 0 && (
                    <div className="text-xs text-gray-500">
                      ${service.deposit_amount} deposit
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <Badge
                    variant={service.is_active ? "default" : "secondary"}
                    className={`text-xs ${
                      service.is_active
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-orange-100 text-orange-800 border-orange-200"
                    }`}
                  >
                    {service.is_active ? "Active" : "Draft"}
                  </Badge>
                </div>

                {/* Capacity */}
                <div className="col-span-1">
                  <span className="text-sm text-gray-900">
                    {service.max_capacity}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <Link href={`/admin/services/${service.id}/edit`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit service</span>
                    </Link>
                  </Button>
                  
                  <DeleteServiceButton 
                    serviceId={service.id} 
                    variant="list"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {services.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500">No services found</p>
        </div>
      )}
    </div>
  );
}