"use client";

import Link from "next/link";
import type { Service } from "@/lib/types/landing";

interface FeaturedServicesProps {
  services: Service[];
}

export function FeaturedServices({ services }: FeaturedServicesProps) {
  if (services.length === 0) return null;
  const highlight = services[0];
  const image = highlight.imageUrls?.[0] || highlight.imageUrl;

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="rounded-[28px] border border-border bg-muted/30 p-6 shadow-[var(--shadow-card)] sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="overflow-hidden rounded-3xl bg-muted">
              {image ? (
                <img
                  src={image}
                  alt={highlight.publicName || highlight.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Highlight Image
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Monthly highlight
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {highlight.publicName || highlight.name}
              </h2>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                {highlight.description ||
                  "A premium experience curated for focus, clarity, and convenience."}
              </p>

              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                <li>- Concierge service included</li>
                <li>- Flexible schedule options</li>
                <li>- Designed for premium clientele</li>
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href={`/book/${highlight.id}?serviceId=${highlight.id}`}
                  className="motion-standard motion-press rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground shadow-[var(--shadow-card)] hover:bg-primary/90 motion-reduce:transition-none"
                >
                  Explore session
                </Link>
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  {highlight.durationMinutes} min - ${highlight.price}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
