"use client";

import Link from "next/link";
import { ServiceCard } from "./ServiceCard";
import type { Service } from "@/lib/types/landing";

interface FeaturedServicesProps {
  services: Service[];
}

export function FeaturedServices({ services }: FeaturedServicesProps) {
  if (services.length === 0) return null;

  return (
    <section className="bg-muted/20">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-12 flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Chef's recommendations
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Featured Services
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              A selection of our most requested experiences.
            </p>
          </div>
          <Link
            href="#services"
            className="text-sm font-semibold text-foreground/70 underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            View full menu
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {services.slice(0, 4).map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
