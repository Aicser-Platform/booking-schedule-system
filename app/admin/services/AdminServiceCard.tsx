"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Edit, Eye } from "lucide-react";
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

type AdminServiceCardProps = {
  service: ServiceRow;
};

// Service category mapping based on name patterns
const getServiceCategory = (
  name: string,
  description?: string | null,
): string => {
  const text = `${name} ${description || ""}`.toLowerCase();

  if (text.includes("hydra") || text.includes("facial")) return "WELLNESS";
  if (text.includes("massage") || text.includes("tissue")) return "THERAPY";
  if (text.includes("sauna") || text.includes("nordic")) return "RITUAL";
  if (text.includes("stone") || text.includes("therapy")) return "THERAPY";

  return "WELLNESS";
};

export default function AdminServiceCard({ service }: AdminServiceCardProps) {
  const images = useMemo(() => {
    if (service.image_urls && service.image_urls.length > 0) {
      return service.image_urls;
    }
    if (service.image_url) return [service.image_url];
    return [];
  }, [service.image_urls, service.image_url]);

  const [imageIndex, setImageIndex] = useState(0);
  const activeImage = images[imageIndex];
  const hasMultipleImages = images.length > 1;
  const category = getServiceCategory(service.name, service.description);
  const price = Number(service.price ?? 0);
  const depositAmount = Number(service.deposit_amount ?? 0);
  const formattedPrice = Number.isFinite(price) ? price.toFixed(2) : "0.00";
  const formattedDeposit = Number.isFinite(depositAmount)
    ? depositAmount.toFixed(2)
    : "0.00";

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-card/90 shadow-sm border border-border/40 transition-all duration-300 hover:shadow-lg">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {activeImage ? (
          <img
            src={activeImage}
            alt={service.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
            <Eye className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            className={`text-xs font-medium px-3 py-1 rounded-full border-2 ${
              service.is_active
                ? "bg-green-100 text-green-800 border-green-300"
                : "bg-orange-100 text-orange-800 border-orange-300"
            }`}
          >
            {service.is_active ? "ACTIVE" : "DRAFT"}
          </Badge>
        </div>

        {/* Image Navigation */}
        {hasMultipleImages && (
          <>
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous image"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setImageIndex((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1,
                  );
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-lg transition-all hover:bg-card hover:shadow-xl"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setImageIndex((prev) => (prev + 1) % images.length);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-lg transition-all hover:bg-card hover:shadow-xl"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute bottom-4 left-4 rounded-full bg-card/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground shadow-lg">
              {imageIndex + 1}/{images.length}
            </div>
          </>
        )}

        {/* Featured Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
            FEATURED
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                {category}
              </div>
              <h3 className="text-lg font-bold text-foreground leading-tight">
                {service.name}
              </h3>
            </div>
          </div>

          {service.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {service.description}
            </p>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Duration
            </p>
            <p className="text-sm font-bold text-foreground">
              {service.duration_minutes} mins
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Price
            </p>
            <p className="text-sm font-bold text-foreground">
              ${formattedPrice}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        {(depositAmount > 0 || service.max_capacity > 1) && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {depositAmount > 0 && (
              <span>${formattedDeposit} deposit required</span>
            )}
            {service.max_capacity > 1 && (
              <span>Max {service.max_capacity} guests</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            asChild
            size="sm"
            className="flex-1 rounded-full bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90"
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
}
