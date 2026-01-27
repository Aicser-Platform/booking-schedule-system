"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Service } from "@/lib/types/landing";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const displayName = service.publicName || service.name;
  const images = useMemo(() => {
    if (service.imageUrls && service.imageUrls.length > 0) {
      return service.imageUrls;
    }
    if (service.imageUrl) return [service.imageUrl];
    return [];
  }, [service.imageUrls, service.imageUrl]);
  const [imageIndex, setImageIndex] = useState(0);
  const depositAmount = service.depositAmount
    ? Number(service.depositAmount)
    : 0;
  const tags = new Set(service.tags ?? []);
  const totalImages = images.length;
  const hasMultipleImages = totalImages > 1;
  const displayIndex =
    totalImages === 0 ? 0 : Math.min(imageIndex, totalImages - 1);
  const activeImage = images[displayIndex];

  if (depositAmount > 0) {
    tags.add("Deposit");
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card motion-card motion-reduce:transition-none">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {activeImage ? (
          <img
            src={activeImage}
            alt={displayName}
            loading="lazy"
            className="h-full w-full object-cover motion-standard motion-safe:group-hover:scale-[1.02] motion-reduce:transform-none"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Service Image
          </div>
        )}
        {hasMultipleImages && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous image"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setImageIndex(() =>
                  displayIndex === 0 ? totalImages - 1 : displayIndex - 1,
                );
              }}
              className="motion-standard motion-press flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-[var(--shadow-card)] hover:bg-muted motion-reduce:transition-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setImageIndex(() => (displayIndex + 1) % totalImages);
              }}
              className="motion-standard motion-press flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-[var(--shadow-card)] hover:bg-muted motion-reduce:transition-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="absolute right-4 top-4 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-[var(--shadow-card)]">
          ${service.price}
        </div>
        {tags.size > 0 && (
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {Array.from(tags)
              .slice(0, 1)
              .map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="rounded-full border-border bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/70"
                >
                  {tag}
                </Badge>
              ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        {service.category && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {service.category}
          </p>
        )}
        <h3 className="mt-3 text-lg font-semibold leading-snug">
          {displayName}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {service.description || "Service details available upon booking."}
        </p>

        <div className="mt-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <span>{service.durationMinutes} min</span>
          {depositAmount > 0 && <span>Deposit ${depositAmount}</span>}
        </div>

        <div className="mt-5 flex items-center justify-end">
          <Link
            href={`/book/${service.id}?serviceId=${service.id}`}
            className="motion-standard text-xs font-semibold uppercase tracking-[0.25em] text-primary hover:text-primary/80"
          >
            Book now
          </Link>
        </div>
      </div>
    </article>
  );
}
