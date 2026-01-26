"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Service } from "@/lib/types/landing";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const displayName = service.publicName || service.name;
  const image = service.imageUrls?.[0] || service.imageUrl;
  const depositAmount = service.depositAmount
    ? Number(service.depositAmount)
    : 0;
  const tags = new Set(service.tags ?? []);

  if (depositAmount > 0) {
    tags.add("Deposit");
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={displayName}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Service Image
          </div>
        )}
        <div className="absolute right-4 top-4 rounded-full bg-background/95 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm">
          ${service.price}
        </div>
        {tags.size > 0 && (
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {Array.from(tags).slice(0, 1).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="rounded-full border-border bg-background/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/70"
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
            className="text-xs font-semibold uppercase tracking-[0.25em] text-primary transition-colors hover:text-primary/80"
          >
            Book now
          </Link>
        </div>
      </div>
    </article>
  );
}
