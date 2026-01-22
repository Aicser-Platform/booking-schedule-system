"use client";

import { ServiceCard } from "./ServiceCard";
import type { Service } from "@/lib/types/landing";
import { Skeleton } from "@/components/ui/skeleton";

interface ServicesGridProps {
  services: Service[];
  isLoading?: boolean;
}

export function ServicesGrid({ services, isLoading }: ServicesGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-6 rounded-3xl border border-border/60 bg-card/80 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm"
          >
            <Skeleton className="aspect-square h-[180px] w-[180px] flex-shrink-0 rounded-2xl" />
            <div className="flex flex-1 flex-col gap-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-border/60 bg-muted/10">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted-foreground/10" />
          <p className="text-lg font-semibold">No services found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your filters to see more results
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {services.map((service, index) => (
        <div
          key={service.id}
          className="motion-safe:animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ServiceCard service={service} />
        </div>
      ))}
    </div>
  );
}
